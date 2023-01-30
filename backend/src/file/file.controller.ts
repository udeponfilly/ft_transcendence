import {
	Controller,
	Get,
	Res,
	Param,
	NotFoundException,
	ForbiddenException,
	UseGuards,
} from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path'
import { ConfigService } from '@nestjs/config';

@Controller('file')
export class FileController {

	@Get('/avatar/:filename')
	async getFile(@Param('filename') filename: string, @Res() res): Promise<any> {
		const config = new ConfigService()
		const filePath = `${config.get('UPLOAD_PATH')}/${filename}`

		if (!fs.existsSync(filePath)) {
			throw new NotFoundException()
		}
		if (path.extname(filePath) !== ".jpg"
			&& path.extname(filePath) !== ".jpeg") {
				throw new ForbiddenException()
		}
		res.sendFile(filename, { root: config.get('UPLOAD_PATH') });
	}
}
