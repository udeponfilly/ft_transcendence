import { useSelector } from "react-redux"
import { selectCurrentUser } from '../../Hooks/authSlice'
import { selectUserlist } from '../../Hooks/userListSlice'
import ConnectedUsers from './ConnectedUsers';
import {
	Avatar,
	Box,
	Link,
	Typography
} from '@mui/material';

import { userProfile } from '../chat/stateInterface';
import { useNavigate } from "react-router-dom";
import { styled, alpha } from '@mui/material/styles';
import FriendSection from "./FriendList";
import './Dashboard.css'

interface allUsers {
	id: number,
	User: string,
	status: string,
	playgame: string,
}


function UserCard() {
	const currentUser = useSelector(selectCurrentUser)

	const StyledAccount = styled('div')(({ theme }) => ({
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(2, 2.5),
		borderRadius: Number(theme.shape.borderRadius) * 1.5,
		backgroundColor: alpha(theme.palette.grey[500], 0.12),
	}));

	return (
		<Box sx={{ mb: 5, mx: 2.5 }}>
			<Link underline="none">
			<StyledAccount>
				<Avatar src={currentUser.avatar} alt="photoURL" />
				<Box sx={{ ml: 2 }}>
				<Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
					{
						`${currentUser.username.substring(0, 11)}${
						currentUser.username.length <= 11 ? "" : "..."}`
					}
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					{currentUser.login}
				</Typography>
				</Box>
			</StyledAccount>
			</Link>
		</Box>
	)
}

export default function Dashboard() {
	const navigate 		= useNavigate();
	const currentUser 	= useSelector(selectCurrentUser)
	const userList 		= useSelector(selectUserlist).userList
	
	const userListWithoutCurrentUser = () => {
		let ret: userProfile[] = structuredClone(userList);

		for (let i = 0; i < ret.length; i++) {
			if (!ret[i].id || ret[i].id === currentUser.id)
				ret.splice(i, 1);
		}
		return (ret);
	}
	const getAllUsersTab = () => {
		let allUsers: allUsers[] = [];
		let userListWithoutCurrentUserArr = userListWithoutCurrentUser();

		for (let user of userListWithoutCurrentUserArr) {
			const tmp: allUsers = {
				id: user.id,
				User: user.username,
				status: user.status,
				playgame: user.status === "in game" ? "View" : user.status === "online" ? "Play" : "",
			}
			allUsers.push(tmp);
		}
		return (allUsers);
	}

	const isFriend = (id: number) => {
		if (!currentUser.friends)
			return false
		for (let friend of currentUser.friends) {
			if (id === friend.id)
				return true;
		}
		return false;
	}

	return (
		<div>
			<div className="dashboard">
				<div className="userCol">
					<div className="userCol">
						<UserCard/>
						{currentUser.friends.length
							? <div>
									<Typography sx={{ color: 'text.primary', fontWeight: 'bold' }}>
										Friends:
									</Typography>
									<FriendSection data={userListWithoutCurrentUser().filter((user) => isFriend(user.id))}/>
								</div>
							: null}
					</div>
				</div>
				<div className="userContentContainer">
					<div className="contentCol">
							<div className="connectedUsers"><ConnectedUsers allUsersTab={getAllUsersTab()} navigate={navigate} /></div>
					</div>
				</div>
			</div>
		</div>
	);
}
