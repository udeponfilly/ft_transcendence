import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
	constructor(private prisma: PrismaService) {}

	async message(
		messageWhereUniqueInput: Prisma.MessageWhereUniqueInput
	): Promise<Message | null> {
		return this.prisma.message.findUnique({
			where: messageWhereUniqueInput,
			include: {
				channel: true,
				author: true,
			},
		});
	}

	async messages(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.MessageWhereUniqueInput;
		where?: Prisma.MessageWhereInput;
		orderBy?: Prisma.MessageOrderByWithRelationInput;
	}): Promise<Message[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.message.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
		});
	}
	
	async createMessage(data: Prisma.MessageCreateInput, channelId: number, authorId: number): Promise<Message> {
		let chan = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
			include: {
				members: {
					include: {
						blacklist: true,
					}
				},
				blacklist: true,
			}
		});
		if (chan.type === "dm") {
			let otherUser;
			if (authorId === chan.members[0].id)
				otherUser = chan.members[1];
			else
				otherUser = chan.members[0];
			for (let blacklist of otherUser.blacklist) {
				if (blacklist.target_id === authorId && blacklist.type === "block")
					throw new ForbiddenException;
			}
		}
		else {
			for (let blacklist of chan.blacklist) {
				if (blacklist.target_id === authorId && blacklist.type === "mute") {
					if (new Date().getTime() / 1000 - new Date(blacklist.date).getTime() / 1000 >= 60 * blacklist.delay) {
						await this.prisma.blacklist.delete({
							where: {
								id: blacklist.id,
							}
						});
						break ;
					}
					else
						throw new ForbiddenException ;
				}
			}
		}
		return this.prisma.message.create({
			data,
		});
	}

	async updateMessage(params: {
		where: Prisma.MessageWhereUniqueInput;
		data: Prisma.MessageUpdateInput;
	}): Promise<Message> {
		const { where, data } = params;
		return this.prisma.message.update({
			data,
			where,
		});
	}

	async deleteMessage(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
		return this.prisma.message.delete({
			where,
		});
	}
}
