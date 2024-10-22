import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TokenPriceService } from './tokenPrice.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { TokenPriceController } from './tokenPrice.controller';
import { MoralisModule } from 'src/moralis/moralis.module';

@Module({
  imports: [DatabaseModule, TokensModule, MoralisModule],
  controllers: [TokenPriceController],
  providers: [TokenPriceService],
  exports: [TokenPriceService],
})
export class TokenPriceModule {}
