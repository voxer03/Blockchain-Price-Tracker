import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';

export const MORALIS = Symbol('MORALIS');

export type MoralisInjectable = typeof Moralis;

export const MoralisProvider: FactoryProvider<MoralisInjectable> = {
  inject: [ConfigService],
  provide: MORALIS,
  useFactory: async (config: ConfigService): Promise<MoralisInjectable> => {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: config.get('MORALIS_API_KEY'),
      });
    }

    return Moralis;
  },
};
