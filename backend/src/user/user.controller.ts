import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Body,
  UseFilters,
  Delete,
  UseInterceptors,
  UploadedFile,
  UnprocessableEntityException,
  UseGuards,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User as UserMode1 } from "@prisma/client";
import { FileInterceptor } from "@nestjs/platform-express";
import { fileInterceptorOptions } from "../file/fileInterceptorOptions";
import { DeleteFileOnErrorFilter } from "../file/fileUpload.filter";
import { fileValidator } from "../file/ConstantfileValidator";
import OwnGuard from "../auth/own.guard";
import { updateUserDto } from "./upateUserDto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

class CreateUser {
  username: string;
  login: string;
}

class Game {
  id: number;
  date: string;
  playerScore: number;
  opponent: string;
  opponentScore: number;
  result: string;
}

class UserStats {
  id: number;
  avatar: string;
  username: string;
  games: Game[];
  playedGames: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
}

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<UserMode1[]> {
    return this.userService.users({});
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param("id") id: string): Promise<UserMode1> {
    return this.userService.user({ id: Number(id) });
  }

  @Get("/list/")
  @UseGuards(JwtAuthGuard)
  async getAllUsers(): Promise<UserMode1[]> {
    return this.userService.users({ orderBy: { username: "asc" } });
  }

  @Get("/stats/:id")
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param("id") id: string): Promise<UserStats> {
	let user = (await this.userService.user({ id: Number(id) })) as any;
	if (!user)
		throw new NotFoundException()
    let games = [...user.p1_games, ...user.p2_games];
    let gamesPlayed = games.map((game) => {
      let player = game.player1Id === user.id ? 1 : 2;
      return {
        id: game.id,
        date: game.date,
        playerScore: player === 1 ? game.player1_score : game.player2_score,
        opponent: player === 1 ? game.player2.username : game.player1.username,
        opponentScore: player === 1 ? game.player2_score : game.player1_score,
        result:
          player === 1
            ? game.player1_score > game.player2_score
              ? "Winner"
              : game.player2_score > game.player1_score
              ? "Loser"
              : "Equality"
            : game.player2_score > game.player1_score
            ? "Winner"
            : game.player1_score > game.player2_score
            ? "Loser"
            : "Equality",
      };
    });
    let winrate = Math.round(
      (gamesPlayed.filter(function (obj) {
        return obj.result === "Winner";
      }).length /
        gamesPlayed.length) *
        100
    );
    const data = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      games: gamesPlayed,
      playedGames: gamesPlayed.length,
      gamesWon: gamesPlayed.filter(function (obj) {
        return obj.result === "Winner";
      }).length,
      gamesLost: gamesPlayed.filter(function (obj) {
        return obj.result === "Loser";
      }).length,
      winRate: winrate ? winrate : -1,
    };
    return data;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param("id") id: string): Promise<UserMode1> {
    return this.userService.deleteUser({ id: Number(id) });
  }

  @Put("/upload/avatar/:id")
  @UseGuards(OwnGuard)
  @UseInterceptors(FileInterceptor("file", fileInterceptorOptions))
  @UseFilters(DeleteFileOnErrorFilter)
  @UseGuards(JwtAuthGuard)
  async uploadAvatar(
    @UploadedFile(fileValidator) file: Express.Multer.File,
    @Param("id") id: string
  ): Promise<UserMode1> {
    const imageUrl = `http://localhost:3000/file/avatar/${file.filename}`;
    let updatedData = {
      avatar: imageUrl,
    };
    return this.userService.updateUser({
      where: {
        id: Number(id),
      },
      data: updatedData,
    });
  }

  @Put("/addFriend/:id/:target")
  @UseGuards(OwnGuard)
  @UseGuards(JwtAuthGuard)
  async userAddFriend(
    @Param("id") user1: string,
    @Param("target") user2: string
  ): Promise<UserMode1> {
    return await this.userService.addFriendship(
      { id: Number(user1) },
      { id: Number(user2) }
    );
  }

  @Put("/removeFriend/:id/:target")
  @UseGuards(OwnGuard)
  @UseGuards(JwtAuthGuard)
  async userRemoveFriend(
    @Param("id") user1: string,
    @Param("target") user2: string
  ): Promise<UserMode1> {
    return await this.userService.removeFriendship(
      { id: Number(user1) },
      { id: Number(user2) }
    );
  }

  @Put(":id")
  @UsePipes(new ValidationPipe({ forbidUnknownValues: true, whitelist: true }))
  @UseGuards(OwnGuard)
  @UseGuards(JwtAuthGuard)
  async updateUserName(
    @Param("id") id: string,
    @Body() body: updateUserDto
  ): Promise<UserMode1> {
    if (body.username.indexOf(" ") !== -1) throw new BadRequestException();
    const user = await this.userService.user({ id: Number(id) });
    const userWithSameUsername = await this.userService.user({
      username: String(body.username),
    });
    if (userWithSameUsername && userWithSameUsername.id !== Number(id))
      throw new UnprocessableEntityException();
    user.username = body.username;
    return this.userService.updateUser({
      where: {
        id: Number(id),
      },
      data: {
        username: user.username,
      },
    });
  }

  @Get("/tfa/:id")
  @UseGuards(OwnGuard)
  @UseGuards(JwtAuthGuard)
  async getTfaQrCode(@Param("id") id: string) {
    const otpauthUrl = await this.userService.getOtpAuthUrl({ id: Number(id) });
    return this.userService.generateQrCodeDataURL(otpauthUrl);
  }

  @Put("/tfa/:id")
  @UseGuards(OwnGuard)
  @UseGuards(JwtAuthGuard)
  async updateTfa(@Param("id") id: string, @Body() body: any) {
    this.userService.updateUser({
      where: {
        id: Number(id),
      },
      data: {
        isTFAEnabled: body.enableTfa,
      },
    });
    return { isTFAEnabled: body.enableTfa };
  }
}
