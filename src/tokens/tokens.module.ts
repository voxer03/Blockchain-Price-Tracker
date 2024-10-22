import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TokenService } from './tokens.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokensModule {}
