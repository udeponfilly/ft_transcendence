import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Delete,
	UseFilters,
	UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import {  Message as MessageMode1 } from '@prisma/client';
import BackendException from '../utils/BackendException.filter'
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Get(':id')
	async getMessageById(@Param('id') id: string): Promise<MessageMode1> {
		return this.messageService.message({ id: Number(id) });
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Post()
	async newMessage (
		@Body() messageData: { channelId: string; authorId: string; content: string }
	): Promise<MessageMode1> {
		const newMsg = await this.messageService.createMessage({
			content: messageData.content,
			channel: { connect: { id: Number(messageData.channelId) } },
			author: { connect: { id: Number(messageData.authorId) } },
		}, Number(messageData.channelId), Number(messageData.authorId));
		if (newMsg === null)
			return (null);
		return this.messageService.message({ id: newMsg.id })
	}
}
