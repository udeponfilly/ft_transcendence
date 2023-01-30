import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Channel, Prisma } from '@prisma/client';
import { retry } from 'rxjs';

@Injectable()
export class ChannelService {
	constructor(private prisma: PrismaService) {}

	async channel(
		channelWhereUniqueInput: Prisma.ChannelWhereUniqueInput
	): Promise<Channel | null> {
		let chan = await this.prisma.channel.findUnique({
			where: channelWhereUniqueInput,
			include: {
				Message:  {
					include: {
						author: true,
					}
				},
				blacklist: true,
				admin: true,
				members: true,
				owner: true,
			},
		});
		return chan ;
	}

	async allChannels(): Promise<Channel[] | null> {
		let chans = await this.prisma.channel.findMany({
			include: {
				blacklist: true,
				admin: true,
				members: true,
				owner: true
			}
		});
		for (let chan of chans) {
			delete chan.password ;
		}
		return chans ;
	}

	async joinedChannels(userId: number): Promise<Channel[] | null> {
		let chans = await this.prisma.channel.findMany({
			where: {
				members: {
					some: {
						id: userId
					}
				}
			},
			include: {
				Message:  {
					include: {
						author: true,
					}
				},
				blacklist: true,
				admin: true,
				members: true,
				owner: true
			},
		});
		for (let chan of chans) {
			delete chan.password ;
		}
		return chans ;
	}

	async notJoinedChannels(userId: number): Promise<Channel[] | null> {
		let chans = await this.prisma.channel.findMany({
			where: {
				members: {
					none: {
						id: userId
					},
				},
				NOT: {
					type: "dm",
				},
			},
			include: {
				blacklist: true,
				admin: true,
				members: true,
				owner: true
			},
		});
		for (let chan of chans) {
			delete chan.password ;
		}
		return chans;
	}

	async channels(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.ChannelWhereUniqueInput;
		where?: Prisma.ChannelWhereInput;
		orderBy?: Prisma.ChannelOrderByWithRelationInput;
	}): Promise<Channel[]> {
		const { skip, take, cursor, where, orderBy } = params;
		let chans = await this.prisma.channel.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
		});
		for (let chan of chans) {
			delete chan.password ;
		}
		return chans ;
	}

	async createChannel(data: Prisma.ChannelCreateInput): Promise<Channel> {
		let chan = await this.prisma.channel.findMany({
			where: {
				title: data.title,
			}
		});
		if (chan.length === 0 || data.type === 'dm') {
			let chan = await this.prisma.channel.create({
				data,
			});
			delete chan.password ;
			return chan ;
		}
		throw new ForbiddenException ;
	}

	async updateChannel(params: {
		where: Prisma.ChannelWhereUniqueInput;
		data: Prisma.ChannelUpdateInput;
	}): Promise<Channel> {
		const { where, data } = params;
		let chan = await this.prisma.channel.update({
			data,
			where,
		});
		delete chan.password ;
		return chan ;
	}

	async setPwd(data: {pwd: string, channelId: number, userId: number}): Promise<Channel> {
		const chan = await this.prisma.channel.findUnique( {
			where: {
				id: data.channelId,
			},
			include: {
				Message:  {
					include: {
						author: true,
					}
				},
				blacklist: true,
				admin: true,
				members: true,
				owner: true
			}
		})
		let type;
		if (data.pwd === "")
			type = "public";
		else
			type = "private";
		if (chan.ownerId && chan.ownerId === data.userId) {
			let chan = await this.prisma.channel.update({
				where: {
					id : data.channelId,
				},
				data: {
					password: data.pwd,
					type: type,
				},
				include: {
					Message:  {
						include: {
							author: true,
						}
					},
					blacklist: true,
					admin: true,
					members: true,
					owner: true,
				}
			});
			delete chan.password ;
			return chan ;
		}
		else
			throw new ForbiddenException ;
	}

	async addAdmin(data: {adminId: number, chanId: number, userId: number}): Promise<Channel> {
		const chan = await this.prisma.channel.findUnique( {
			where: {
				id: data.chanId,
			},
			include: {
				Message:  {
					include: {
						author: true,
					}
				},
				blacklist: true,
				admin: true,
				members: true,
				owner: true
			},
		}) ;
		let userIsAdmin = false ;
		for (let admin of chan.admin) {
			if (admin.id === data.adminId)
				throw new ForbiddenException ;
			if (admin.id === data.userId) {
				userIsAdmin = true ;
				break ;
			}
		}
		if (userIsAdmin) {
			let chan = await this.prisma.channel.update({
				where: {
					id : data.chanId,
				},
				data: {
					admin: {
						connect: {
							id : data.adminId,
						}
					}
				},
				include: {
					Message:  {
						include: {
							author: true,
						}
					},
					blacklist: true,
					admin: true,
					members: true,
					owner: true
				}
			});
			delete chan.password ;
			return chan ;
		}
		else
			throw new ForbiddenException ;


	}
	async deleteMember(data: {channelId: number, memberId: number, authorId: number}): Promise<Channel> {
		const chan = await this.prisma.channel.findUnique( {
			where: {
				id: data.channelId,
			},
			include: {
				admin: true,
			}
		})


		let userIsAdmin = false ;
		for (let admin of chan.admin) {
			if (admin.id === data.authorId) {
				userIsAdmin = true ;
				break ;
			}
		}
		if (data.memberId != data.authorId && !userIsAdmin)
			throw new ForbiddenException();
		
		let ret_chan = await this.prisma.channel.update({
			where: {
				id: data.channelId,
			},
			data: {
				members: {
					disconnect: {
						id: data.memberId,
					}
				},
				admin: {
					disconnect: {
						id: data.memberId,
					}
				},
				ownerId: chan.ownerId === data.memberId ? null : chan.ownerId,
			},
			include: {
				Message:  {
					include: {
						author: true,
					}
				},
				blacklist: true,
				admin: true,
				members: true,
				owner: true
			},
		});
		delete ret_chan.password ;
		return ret_chan ;
	}

	async addMember(data: {channelId: number, memberId: number}): Promise<Channel> {
		const chan = await this.prisma.channel.findUnique( {
			where: {
				id: data.channelId,
			},
			include: {
				admin: true,
				blacklist: true,
			}
		})
		for (let blacklist of chan.blacklist) {
			if (blacklist.target_id === data.memberId && blacklist.type === "ban") {
				if (new Date().getTime() / 1000 - new Date(blacklist.date).getTime() / 1000 >= 60 * blacklist.delay) {
					await this.prisma.blacklist.delete({
						where: {
							id: blacklist.id,
						}
					});
					break ;
				}
				else
					throw new ForbiddenException() ;
			}
		}
		let ret_chan ;
		if (chan.admin.length === 0){
			ret_chan = await this.prisma.channel.update({
				where: {
					id: data.channelId,
				},
				data: {
					members: {
						connect: {
							id: data.memberId,
						}
					},
					admin: {
						connect: {
							id: data.memberId, 
						}
					}
				},
				include: {
					Message:  {
						include: {
							author: true,
						}
					},
					blacklist: true,
					admin: true,
					members: true,
					owner: true
				},
			});
		}
		else {
			ret_chan = await this.prisma.channel.update({
				where: {
					id: data.channelId,
				},
				data: {
					members: {
						connect: {
							id: data.memberId,
						}
					},
				},
				include: {
					Message:  {
						include: {
							author: true,
						}
					},
					blacklist: true,
					admin: true,
					members: true,
					owner: true
				},
			});
		}
		delete ret_chan.password ;
		return ret_chan ;
	}

	async deleteChannel(where: Prisma.ChannelWhereUniqueInput): Promise<Channel> {
		let chan = await this.prisma.channel.delete({
			where,
		});
		delete chan.password ;
		return chan ;
	}
}
