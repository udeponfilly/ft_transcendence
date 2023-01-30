import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PrismaService } from "./prisma/prisma.service";
import { UserModule } from "./user/user.module";
import { ChannelModule } from "./channel/channel.module";
import { BlacklistModule } from "./blacklist/blacklist.module";
import { GameModule } from "./game/game.module";
import { MessageModule } from "./message/message.module";
import { GameGateway } from "./game.gateway";
import { AuthModule } from "./auth/auth.module";
import { ChatGateway } from "./chat.gateway";
import { MulterModule } from "@nestjs/platform-express";
import { FileModule } from "./file/file.module";
import { getEnvPath } from "./utils/env.helper";
import { ConfigModule } from "@nestjs/config";
import { AppGateway } from "./app.gateway";
import { UserService } from "./user/user.service";
const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    PrismaModule,
    UserModule,
    ChannelModule,
    BlacklistModule,
    GameModule,
    MessageModule,
    AuthModule,
    MulterModule.register({
      dest: "/app/src/uploaded_files",
    }),
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    GameGateway,
    ChatGateway,
    AppGateway,
    UserService,
  ],
})
export class AppModule {}
