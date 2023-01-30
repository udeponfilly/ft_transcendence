import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Catch(UnprocessableEntityException)
export class DeleteFileOnErrorFilter implements ExceptionFilter {
	catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		if (request.file) {
			fs.unlink(request.file.path, (err) => {
				if (err)
					return err;
			});
		}
		response.status(status).json(exception.getResponse());
	}
}
