import { Module } from '@nestjs/common';

import { MoralisProvider } from './moralis.provider';
import { MoralisService } from './moralis.service';

@Module({
  exports: [MoralisService],
  providers: [MoralisProvider, MoralisService],
})
export class MoralisModule {}
