import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceAlerts, Prisma, Token, TokenPrice } from '@prisma/client';
import { MailService } from 'src/mailer/mailer.service';
import { MoralisService } from 'src/moralis/moralis.service';
import { PriceAlertService } from 'src/priceAlert/priceAlert.service';
import { TokenPriceService } from 'src/tokenPrice/tokenPrice.service';
import { TokenService } from 'src/tokens/tokens.service';
import {
  ITokenPrice,
  PriceAlertWithToken,
  PercentageChangeReturnValue,
} from 'src/common/types';

@Injectable()
export class PriceSchedulerService {
  private readonly logger = new Logger(PriceSchedulerService.name);
  
  private tokensArray: string[];
  private tokensMap: Map<string, number>;

  /**
   * Default Constructor.
   *
   * */
  constructor(
    private readonly configService: ConfigService,
    private readonly moralisService: MoralisService,
    private tokensService: TokenService,
    private tokensPriceService: TokenPriceService,
    private priceAlertService: PriceAlertService,
    private mailService: MailService,
  ) {
    this.initializeTokens();
  }

  /**
   * Function to initialize the tokens map and array by fetching the list of tokens.
   * To be used by other functions, simple chaching implemented as data size is small.
   *
   * @returns A Promise that resolves when the tokens have been successfully initialized.
   */
  async initializeTokens() {
    this.tokensMap = new Map();
    const tokens = await this.tokensService.getTokensList({});
    this.tokensArray = tokens.map((token: Token) => token.address);
    tokens.forEach((token: Token) => {
      this.tokensMap.set(token.address.toLowerCase(), token.id);
    });
  }

  /**
   * Cron job to fetch and process token prices every 5 minutes.
   */
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'price-fetcher' })
  handleCron() {
    try {
      this.logger.debug('Called every 5 minutes....');
      this.fetchAndProcessTokenPrices();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  /**
   * Function to fetch and process token prices from Moralis.
   *
   * This function performs the following operations:
   *
   * 1. Retrieves the current prices for a predefined array of tokens using the Moralis service.
   * 2. Maps the token addresses from the Moralis response to their corresponding token IDs.
   * 3. Stores the fetched token prices in the database by calling the `createMultipleTokenPrices` service.
   * 4. Checks the price percentage change compared to previous data and sends alert emails if the change exceeds a threshold (e.g., 3%).
   * 5. Sends user-defined target price alerts based on the current prices.
   *
   * @returns A Promise that resolves when all operations are completed.
   *
   * @throws Logs any errors that occur during the process using the logger.
   */
  async fetchAndProcessTokenPrices() {
    try {
      const response = await this.moralisService.getPriceOfToken(
        this.tokensArray,
      );
      const tokenPrices = response.map((tokenPrice) => ({
        tokenId: this.tokensMap.get(tokenPrice.tokenAddress.toLowerCase()),
        price: tokenPrice.price,
      }));
      // Creates entry in db for current token prices
      await this.tokensPriceService.createMultipleTokenPrices(tokenPrices);

      // Checks and sends mail for percentage change
      await this.alertForPricePercentageChange(tokenPrices);

      //Gets all price alerts for current price and sends alert to specified email
      this.alertForTargePrice(tokenPrices);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Function to check and send email alerts if the price of tokens has increased by 3% or more compared to the prices from one hour ago.
   *
   * This function performs the following steps:
   *
   * 1. Fetches the token prices from one hour ago using the `tokensPriceService`.
   * 2. Calls the `checkPriceIncreaseBy3Percent` function to compare current prices with the one-hour-ago prices and
   *    identifies tokens that have increased by 3% or more.
   * 3. For each token that has increased by 3% or more, This is where the email alert can be sent .
   *
   * @param currentPrices - An array of current token prices that will be compared to the prices from one hour ago.
   * */
  async alertForPricePercentageChange(currentPrices: ITokenPrice[]) {
    const tokensPriceHourAgo =
      await this.tokensPriceService.getTokenPriceOfTokensHourAgo();
    const listOfTokensIncreasedBy3 = this.checkPriceIncreaseBy3Percent(
      currentPrices,
      tokensPriceHourAgo,
    );
    await Promise.all(
      listOfTokensIncreasedBy3.map((token) => {
        const message = `Price of ${token.token.token.name} increased by ${token.percentageIncrease}, current price is ${token.currentPrice}`;

        return this.mailService.sendMail({
          to: this.configService.get<string>('PERCENTAGE_ALERT_EMAIL'),
          subject: `Price of ${token.token.token.name} increased by more than ${this.configService.get('PERCENTAGE_FOR_ALERT')}`,
          message,
        });
      }),
    );
    this.logger.log('Percentage increase of price alert task completed.......');
  }

  /**
   * Function to check and send email alerts when tokens reach their user-defined target prices.
   *
   * This function performs the following:
   *
   * 1. Iterates over the current token prices and retrieves any active price alerts for each token's price using the `priceAlertService`.
   * 2. Collects all matching alerts into an array.
   * 3. Sends notifications for each alert, informing the user that the token has reached the target price.
   *
   * @param tokenPrices - An array of current token prices to check for matching price alerts.
   * @returns A Promise that resolves when all target price alerts are processed.
   *
   */

  async alertForTargePrice(tokenPrices: ITokenPrice[]) {
    const alerts: PriceAlertWithToken[] = [];
    tokenPrices.map(async (token) => {
      const data =
        await this.priceAlertService.getPriceAlertsForGivenTokenAndPrice(
          token.tokenId,
          token.price,
        );
      alerts.concat(data);
    });

    await Promise.all(
      alerts.map((alert) => {
        const message = `Price of ${alert.token.name} reached targeted price of ${alert.price}`;
        return this.mailService.sendMail({
          to: alert.email,
          subject: `Price of ${alert.token.name} reached target price`,
          message,
        });
      }),
    );
    this.logger.log('Target price alert task completed.......');
    return true;
  }

  /**
   * Function to check which tokens have increased in price by 3% or more compared to their prices from one hour ago.
   *
   * This function performs the following:
   *
   * 1. Iterates over the prices from one hour ago and checks for matching tokens in the current prices.
   * 2. For each matching token, it calculates the percentage increase in price.
   * 3. If the percentage increase meets or exceeds the configured threshold (default is 3%),
   *    the token is added to the result array with its current price and percentage increase.
   *
   * @param currentPrices - An array of current token prices.
   * @param lastHourPrices - An array of token prices from one hour ago.
   * @returns An array of objects containing tokens that have increased by 3% or more,
   *          including the token data, percentage increase, and current price.
   */
  checkPriceIncreaseBy3Percent(
    currentPrices: ITokenPrice[],
    lastHourPrices: TokenPrice[],
  ): PercentageChangeReturnValue[] {
    // Result array to store tokens that have increased by 3% or more
    const tokensIncreasedBy3Percent: any[] = [];

    lastHourPrices.forEach((lastHourToken) => {
      const currentToken = currentPrices.find(
        (token) => token.tokenId === lastHourToken.tokenId,
      );

      if (currentToken) {
        const currentPrice = parseFloat(currentToken.price);
        const lastHourPrice = parseFloat(lastHourToken.price);

        const percentageIncrease =
          ((currentPrice - lastHourPrice) / lastHourPrice) * 100;

        if (
          percentageIncrease >=
          this.configService.get<number>('PERCENTAGE_FOR_ALERT')
        ) {
          tokensIncreasedBy3Percent.push({
            token: lastHourToken,
            percentageIncrease,
            currentPrice,
          });
        }
      }
    });

    return tokensIncreasedBy3Percent;
  }
}
