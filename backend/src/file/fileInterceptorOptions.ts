import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { mimeMap } from '../utils/constantMimeMap';
import { ConfigService } from '@nestjs/config';

const config = new ConfigService() 

export const fileInterceptorOptions = {
	storage: diskStorage({
		destination: (req: any, file: any, cb: any) => {
			const uploadPath = config.get('UPLOAD_PATH'); // set path in env var
			if (!existsSync(uploadPath))
				mkdirSync(uploadPath);
			cb(null, uploadPath);
		},	
		filename: function (req, file, cb) {
			const extension: string = mimeMap.get(file.mimetype);
			cb(null, `${file.originalname}${extension}`) // get user login
		},
	})
}