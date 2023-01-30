import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { AuthService } from '../auth/auth.service'; 
import { AuthModule } from '../auth/auth.module'; 


@Module({
  imports: [AuthModule],
  controllers: [FileController],
})
export class FileModule {}
