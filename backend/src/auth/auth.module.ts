import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { Jwt2faStrategy } from './jwt-2fa.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { FtStrategy } from './passeport-42.strategy';

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '2h' },
		}),
	  
	],
	providers: [
		FtStrategy,
		AuthService,
		UserService,
		LocalStrategy,
		JwtStrategy,
		JwtRefreshStrategy,
		Jwt2faStrategy,
		PrismaService
	],
	exports: [AuthService],
	controllers: [AuthController],
})

export class AuthModule {}
