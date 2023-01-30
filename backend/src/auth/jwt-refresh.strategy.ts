import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtRefreshConstants } from './constants';
import jwt from 'jsonwebtoken';


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request?.cookies["jwt"]]),
			ignoreExpiration: false,
			secretOrKey:  jwtRefreshConstants.secret,
		});
	}

	async validate(payload: jwt.JwtPayload) {
		if(payload === null){
			throw new UnauthorizedException();
        }
		return { id: payload.sub, username: payload.username, login: payload.login};
	}
}
