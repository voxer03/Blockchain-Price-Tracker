import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Token, Prisma, TokenPrice } from '@prisma/client';

@Injectable()
export class TokenPriceService {
  /**
   * Default Constructor.
   *
   * */
  constructor(private db: DatabaseService) {}

  /**
   * Function to create multiple token price entries in the database.
   * This function accepts an array of token price data and saves it to the database
   *
   * @param data - An array of token price data (`Prisma.TokenPriceUncheckedCreateInput[]`)
   *               to be inserted into the database.
   *
   * @returns A Promise that resolves when the token prices have been successfully created.
   *
   */
  async createMultipleTokenPrices(
    data: Prisma.TokenPriceUncheckedCreateInput[],
  ): Promise<void> {
    const returnData = await this.db.tokenPrice.createMany({
      data,
    });
  }

  /**
   * Function to retrieve token prices from one hour ago.
   *
   * This function calculates the time range for one hour ago (from 61 minutes to 59 minutes
   * prior to the current time) and fetches token price records from the database
   * that fall within this time range.
   *
   * @returns A Promise that resolves to an array of token prices created within
   *          the last hour, along with associated token information.
   */
  async getTokenPriceOfTokensHourAgo() {
    const currentTime = Date.now();
    const HourAgo = currentTime - 59 * 60 * 1000;
    const extraTime = currentTime - 61 * 60 * 1000;
    return this.db.tokenPrice.findMany({
      where: {
        createdAt: {
          lte: new Date(HourAgo),
          gte: new Date(extraTime),
        },
      },
      include: { token: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Function to retrieve token prices for the last 24 hours for a specific token.
   *This function calculates the time range for the last 24 hours and fetches token price
   * records from the database
   *
   * @param tokenId - The ID of the token for which to retrieve price records.
   *
   * @returns A Promise that resolves to an array of token prices created in
   *         the last 24 hours, containing the price and creation date.
   */
  async getTokenPriceOfLast24h(tokenId: number) {
    const currentTime = Date.now();
    const HourAgo = currentTime - 24 * 60 * 60 * 1000;
    return this.db.tokenPrice.findMany({
      where: {
        tokenId,
        createdAt: {
          gte: new Date(HourAgo),
        },
      },
      select: { price: true, createdAt: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
