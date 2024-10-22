import { PriceAlerts, TokenPrice } from '@prisma/client';

export type ResponseData = {
  success: boolean;
  message?: string;
  data?: any;
};

export interface ITokenPrice {
  tokenId: number;
  price: string;
}

export type PriceAlertWithToken = PriceAlerts & {
  token: {
    name: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    address: string;
  };
};

export type PercentageChangeReturnValue = {
  token: TokenPrice & {
    token: {
      name: string;
      id: number;
      createdAt: Date;
      updatedAt: Date;
      address: string;
    };
  };
  percentageIncrease: number;
  currentPrice: number;
};
