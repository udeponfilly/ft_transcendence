import { Injectable, Req, Headers } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User as UserMode1 } from '@prisma/client';
import { jwtRefreshConstants, jwt2faConstants } from './constants';
import {authenticator} from 'otplib'
import jwt from 'jsonwebtoken';
import jwt_decode from "jwt-decode";


@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
		) {}

	async validateUser(username: string, login: string): Promise<UserMode1 | null> {
		const user = await this.userService.user({username: username});

		if (user && user.login === login) {
			return user;
		}
		return null;
	}

	async login(user: UserMode1) {
		return await this.refreshTokens(user)
	}

	async refreshTokens(user?: UserMode1) {
		const payload 		= { username: user.username, sub: user.id };
		const refreshToken	=
			this.jwtService.sign(
				payload,
				{
					secret: jwtRefreshConstants.secret,
					expiresIn: '5h',
				}
			)
		return {
			refresh_token: refreshToken,
			access_token: this.jwtService.sign(payload),
		};
	}

	async whoAmI(@Req() req) {
		let jwtData: jwt.JwtPayload

		if (req?.cookies["jwt"])
			jwtData = jwt_decode(req?.cookies["jwt"])
		else
			jwtData = jwt_decode(req.headers.authorization?.substring(7, req.headers.authorization.length));
		return await this.userService.userWithTfa({ id: Number(jwtData.sub) });
	}

	isTwoFactorAuthenticationCodeValid(TFACode: string, user: UserMode1) {
		return authenticator.verify({
		  token: TFACode,
		  secret: user.TFASecret,
		});
	}

	getTfaJwt(user: UserMode1) {
		const payload = {
			email: user.email,
			sub: user.id
		};

		return {
			email: payload.email,
			access_token: this.jwtService.sign(
				payload,
				{
					secret: jwt2faConstants.secret,
					expiresIn: '5m',
				}
			),
		};
	}
}
