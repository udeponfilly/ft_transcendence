import {
	Controller,
	Get,
	Req,
	Res,
	Post,
	Body,
	UseGuards,
	UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard'
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Jwt2faGuard } from './jwt-2fa.guard';
import { FtOauthGuard } from './ftAuth.guard';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService
	) { }

	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Res({ passthrough: true }) response: Response, @Req() req) {
		const jwt_tokens = await this.authService.login(req.user)
		const userDataResp = {
			username: req.user.username,
			login: req.user.login,
			avatar: req.user.avatar,
			id: req.user.id,
			friends: req.user.friends,
			blacklist: req.user.blacklist,
			blacklisted: req.user.blacklisted,
		}
		response.cookie(
			'jwt',
			jwt_tokens.refresh_token,
			{
				maxAge: 18000000,
				httpOnly: true,
				sameSite: 'none',
				secure: true
			}
		)
		return { user: userDataResp, jwt_token: jwt_tokens.access_token };
	}

	@UseGuards(JwtRefreshAuthGuard)
	@Get('refresh')
	async refresh(@Req() req) {
		const user = await this.authService.whoAmI(req) as any
		const userDataResp = {
			username: user.username,
			login: user.login,
			avatar: user.avatar,
			id: user.id,
			isTFAEnabled: user.isTFAEnabled,
			friends: user.friends,
			blacklist: user.blacklist,
			blacklisted: user.blacklisted,
		}
		const jwt_tokens = await this.authService.refreshTokens(user)
		return { user: userDataResp, jwt_token: jwt_tokens.access_token };
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
		response.status(204)
	}

	@Get('42')
	@UseGuards(FtOauthGuard)
	ftAuth() {
		return;
	}

	@Get('42/return')
	@UseGuards(FtOauthGuard)
	async ftAuthCallback(@Res({ passthrough: true }) response: Response, @Req() req) {
		if (req.user.isTFAEnabled) {
			const jwt_token = this.authService.getTfaJwt(req.user).access_token
			response.redirect(`http://localhost:3001/authenticator?jwt=${jwt_token}`)
			return;
		}
		req = await this.login(response, req)
		response.redirect("http://localhost:3001")
	}

	@Get('/2fa/validate')
	@UseGuards(Jwt2faGuard)
	async tfaValidate() {
	}

	@Post('2fa/authenticate')
	@UseGuards(Jwt2faGuard)
	async authenticate(
		@Res({ passthrough: true }) response: Response,
		@Req() request,
		@Body() body) {
		const user = await this.authService.whoAmI(request)
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			user,
		)
		if (!isCodeValid) {
			throw new UnauthorizedException()
		}
		request.user = user
		return this.login(response, request)
	}
}
