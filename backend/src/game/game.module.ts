import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, GameService],
  controllers: [GameController]
})
export class GameModule {}
