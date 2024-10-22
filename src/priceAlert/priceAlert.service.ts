import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Token, Prisma, PriceAlerts } from '@prisma/client';
import {PriceAlertWithToken} from 'src/common/types'

@Injectable()
export class PriceAlertService {
  /**
   * Default Constructor.
   *
   * */
  constructor(private readonly db: DatabaseService) {}

  /**
   *  Function to create a new price alert in the database.
   * @param data The data required to create a new price alert.
   * @returns A `PriceAlerts` object representing the newly created price alert record in the database.
   */
  async createPriceAlert(
    data: Prisma.PriceAlertsUncheckedCreateInput,
  ): Promise<PriceAlerts> {
    return this.db.priceAlerts.create({ data });
  }

  /**
   * Function to retrieve all price alerts for a given token and price.
   * It also includes related token information in the result.
   *
   * @param tokenId - The unique identifier of the token for which the price alerts are being retrieved.
   * @param price - The price threshold at which the alerts are set. This should be passed as a string to match the `price` field in the database.
   *
   * @returns A Promise that resolves to an array of `PriceAlertWithToken` objects,
   * each representing a price alert that matches the given token ID and price.
   *
   * */
  async getPriceAlertsForGivenTokenAndPrice(
    tokenId: number,
    price: string,
  ): Promise<PriceAlertWithToken[]> {
    return this.db.priceAlerts.findMany({
      where: {
        tokenId,
        price,
      },
      include: { token: true },
    });
  }
}
