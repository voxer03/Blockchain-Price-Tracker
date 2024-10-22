import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceSchedulerService } from './price.scheduler.service';
import { MoralisModule } from 'src/moralis/moralis.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { TokenPriceModule } from 'src/tokenPrice/tokenPrice.module';
import { PriceAlertsModule } from 'src/priceAlert/priceAlert.module';
import { MailModule } from 'src/mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MoralisModule,
    TokensModule,
    TokenPriceModule,
    PriceAlertsModule,
    MailModule,
  ],
  providers: [PriceSchedulerService],
  exports: [PriceSchedulerService],
})
export class SchedulerModule {}
