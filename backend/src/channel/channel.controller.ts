import {
	Controller,
	Get,
	Req,
	Param,
	Post,
	Body,
	UseFilters,
	UseGuards,
	Delete,
	ForbiddenException
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel as ChannelMode1 } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import BackendException from '../utils/BackendException.filter'
import { AuthService } from 'src/auth/auth.service';

@Controller('channel')
export class ChannelController {
	constructor(
		private readonly channelService: ChannelService,
		private readonly authService: AuthService
		) {}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Get(':id')
	async getChannelById(@Param('id') id: string): Promise<ChannelMode1> {
		return this.channelService.channel({ id: Number(id) });
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Get('/joinedChannels/:userId')
	async getJoinedChannels(@Req() req, @Param('userId') userId: string): Promise<ChannelMode1[]> {
		if ((await this.authService.whoAmI(req)).id !== Number(userId))
			throw new ForbiddenException();
		return this.channelService.joinedChannels(Number(userId));
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Get('/notJoinedChannels/:userId')
	async getNotJoinedChannels(@Req() req, @Param('userId') userId: string): Promise<ChannelMode1[]> {
		if ((await this.authService.whoAmI(req)).id !== Number(userId))
			throw new ForbiddenException();
		return this.channelService.notJoinedChannels(Number(userId));
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Get()
	async getAllChannels(): Promise<ChannelMode1[]> {
		return this.channelService.allChannels();
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Delete('/Member/')
	async DeleteMember(
		@Req() req,
		@Body() data: { channelId: string; memberId: string; authorId: string }
	) : Promise<ChannelMode1> {
		if ((await this.authService.whoAmI(req)).id !== Number(data.authorId))
			throw new ForbiddenException();
		return this.channelService.deleteMember({channelId: Number(data.channelId), memberId: Number(data.memberId), authorId: Number(data.authorId)})
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Post('/Member/')
	async PostAddMember(
		@Body() data: { channelId: string; memberId: string; pwd: string; }
	) : Promise<ChannelMode1> {
		let chan = await this.getChannelById(data.channelId);

		if (chan.type === "private") {
			const bcrypt = require ('bcrypt');
			if (!bcrypt.compareSync(data.pwd, chan.password))
				throw new ForbiddenException ;
		}
		return this.channelService.addMember({channelId: Number(data.channelId), memberId: Number(data.memberId)})
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Post('/setPwd/')
	async PostSetPwd(
		@Req() req,
		@Body() data: { pwd: string; channelId: string; userId: string;}
	) : Promise<ChannelMode1> {
		if ((await this.authService.whoAmI(req)).id !== Number(data.userId))
			throw new ForbiddenException();
		const bcrypt = require ('bcrypt');

		const salt = bcrypt.genSaltSync(10);
		let hash = bcrypt.hashSync(data.pwd, salt);
		if (data.pwd === "")
			hash = "";
		return this.channelService.setPwd({pwd: hash, channelId: Number(data.channelId), userId: Number(data.userId)})
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Post('/addAdmin/')
	async PostAddAdmin(
		@Req() req,
		@Body() data: { adminId: string; chanId: string; userId: string;}
	) : Promise<ChannelMode1> {
		if ((await this.authService.whoAmI(req)).id !== Number(data.userId))
			throw new ForbiddenException();
		return this.channelService.addAdmin({adminId: Number(data.adminId), chanId: Number(data.chanId), userId: Number(data.userId)})
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Post('/newChan/')
	async newChannel (
		@Body() channelData: { type: string; password: string; title: string; ownerId: string }
	): Promise<ChannelMode1> {
		const bcrypt = require ('bcrypt');

		const salt = bcrypt.genSaltSync(10);
		let hash = bcrypt.hashSync(channelData.password, salt);
		if (channelData.password === "")
			hash = "";
		let newChan = await this.channelService.createChannel({
			type: channelData.type,
			password: hash,
			title: channelData.title,
			owner: { connect: { id: Number(channelData.ownerId) } },
			members: { connect: { id: Number(channelData.ownerId) } },
			admin: { connect: { id: Number(channelData.ownerId) } },
		});
		return this.channelService.channel({ id: Number(newChan.id) });
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	@Post('/newDM/')
	async newDMChannel (
		@Body() channelData: { user1: string, user2: string }
	): Promise<ChannelMode1> {
		if (!channelData.user1 || !channelData.user1 || channelData.user1 == channelData.user2)
			throw new ForbiddenException();
		let newChan = await this.channelService.createChannel({
			type: "dm",
			members: { connect: [{ id: Number(channelData.user1) }, { id: Number(channelData.user2) }] },
		});
		return this.channelService.channel({ id: Number(newChan.id) });
	}
}
