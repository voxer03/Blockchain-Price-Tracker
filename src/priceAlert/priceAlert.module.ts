import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PriceAlertService } from './priceAlert.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { PriceAlertController } from './priceAlert.controller';

@Module({
  imports: [DatabaseModule, TokensModule],
  controllers: [PriceAlertController],
  providers: [PriceAlertService],
  exports: [PriceAlertService],
})
export class PriceAlertsModule {}
