import { ConfigService } from '@nestjs/config';

const config = new ConfigService() 

export const jwtConstants = {
	secret: config.get('JWT_SECRET')// replace by env var
};

export const jwtRefreshConstants = {
	secret: config.get('JWT_REFRESH_SECRET'),// replace by env var
};

export const jwt2faConstants = {
	secret: config.get('JWT_2FA_SECRET'),// replace by env var
};