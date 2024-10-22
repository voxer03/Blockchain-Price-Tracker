import { Inject, Injectable, Logger } from '@nestjs/common';
import BigNumber from 'bignumber.js';

import { MoralisInjectable, MORALIS } from './moralis.provider';
import { ETH_BTC_PAIR, MORALIS_CHAIN } from 'src/common/constants';

@Injectable()
export class MoralisService {
  private readonly logger = new Logger(MoralisService.name);

  /**
   * Default Constructor.
   *
   * @param moralis - Moralis provider.
   */
  constructor(@Inject(MORALIS) private readonly moralis: MoralisInjectable) {}

  /**
   * Fetches token price for given token addresses.
   *
   * @param tokenAddresses - Array of token addresses.
   * @returns The fetched prices of tokens.
   */
  public async getPriceOfToken(
    tokenAddresses: string[],
  ): Promise<ITokenPrices[]> {
    try {
      if (tokenAddresses.length < 1) {
        return [];
      }
      const tokens = tokenAddresses.map((address) => ({
        tokenAddress: address,
      }));
      const data = await this.moralis.EvmApi.token.getMultipleTokenPrices(
        {
          chain: MORALIS_CHAIN,
        },
        {
          tokens,
        },
      );

      const response = data.toJSON().map((token) => ({
        tokenAddress: token.tokenAddress,
        price: token.usdPriceFormatted,
      }));
      return response;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Computes the quote for swapping Eth for Btc.
   *
   * @param inputEthAmount - The amount of eth needed to be swapped.
   * @returns The computed quote as a string. It's kept as a string to retain maximum precision for very large or very small numbers.
   */
  async getQuoteForSwapingEthForBtc(
    inputEthAmount: BigNumber.Value,
  ): Promise<string> {
    const data = await this.moralis.EvmApi.defi.getPairReserves({
      chain: MORALIS_CHAIN,
      pairAddress: ETH_BTC_PAIR,
    });

    // Using uniswap v2 pair,
    // implemented calculation based on constant product formula
    // deducted fee of 0.3%
    const reserve0 = new BigNumber(data.raw.reserve0);
    const reserve1 = new BigNumber(data.raw.reserve1);
    const input = new BigNumber(10 ** 18).times(inputEthAmount);
    const k = reserve0.times(reserve1);
    const yDeltay = reserve1.plus(input);
    const numerator = reserve0.times(yDeltay).minus(k);
    const ans = numerator.div(yDeltay);
    const fee = ans.times(0.0003);
    const swapAmountAfterFee = ans.minus(fee).toString();

    return this.computeBalance(swapAmountAfterFee, 8);
  }

  /**
   * Computes the actual balance by dividing the raw balance with the appropriate power of 10 based on decimals.
   *
   * @param rawBalance - The raw balance value fetched directly, often represented in the smallest divisible unit (like Wei for Ethereum).
   * @param decimals - The number of decimals that the token uses, which determines the divisor for the raw balance.
   * @returns The computed balance as a string. It's kept as a string to retain maximum precision for very large or very small numbers.
   */
  private computeBalance(rawBalance: string, decimals: number): string {
    return new BigNumber(rawBalance)
      .dividedBy(new BigNumber(10).pow(decimals))
      .toString();
  }
}
