import { HttpStatus, Catch, ExceptionFilter, ArgumentsHost, CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
class OwnGuard implements CanActivate {
	constructor(private authService: AuthService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		return (await this.authService.whoAmI(req)).id === Number(req.params.id)
	}
}

export default OwnGuard
