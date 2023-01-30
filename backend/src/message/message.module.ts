import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, MessageService],
  controllers: [MessageController]
})
export class MessageModule {}
