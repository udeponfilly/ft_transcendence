import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwt2faConstants } from './constants';
import jwt from 'jsonwebtoken';


@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey:  jwt2faConstants.secret,
		});
	}

	async validate(payload: jwt.JwtPayload) {
		if(payload === null){
			throw new UnauthorizedException();
        }
		return { id: payload.sub, username: payload.username, login: payload.login};
	}
}
