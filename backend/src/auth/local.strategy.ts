import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User as UserMode1 } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, login: string): Promise<UserMode1> {
		const user = await this.authService.validateUser(username, login);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
