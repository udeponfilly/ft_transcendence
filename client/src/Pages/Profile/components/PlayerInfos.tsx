import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BadgeAvatar from './Badge'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { selectCurrentUser, selectCurrentToken, setCredentials } from '../../../Hooks/authSlice'
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

function PlayerInfosHook(component: any) {
	return function WrappedPlayerInfos(props: any) {
		const user = useSelector(selectCurrentUser);
		const token = useSelector(selectCurrentToken);
		const navigate = useNavigate();
		const dispatch = useDispatch();
		return (<PlayerInfos dispatch={dispatch} token={token} navigate={navigate} currentUser={user} username={props.username} avatar={props.avatar} userId={props.userId} />)
	}
}

const IsFriend = (currentUser: any, id: number) => {
	if (!currentUser.friends)
		return false
	for (let friend of currentUser.friends) {
		if (id === friend.id)
			return true;
	}
	return false;
}

class PlayerInfos extends React.Component<{ dispatch: any, token: string, navigate: any, currentUser: any, userId: string, username: string, avatar: string }, {}> {

	state = {
		userId: this.props.userId,
		friend: IsFriend(this.props.currentUser, Number(this.props.userId))
	};

	async componentDidUpdate(prevProps: any) {
		if (prevProps.userId !== this.props.userId) {
			this.setState({ userId: this.props.userId })
		}
	}

	async addFriend(dispatch: any, token: string) {
		await axios("http://localhost:3000/user/addFriend/" + this.props.currentUser.id + "/" + this.state.userId,
	        {method:'put', withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
			.then(response => {
				dispatch(setCredentials({
					user: response.data,
					accessToken: token
				}))
				return (response.data)
			})
			.catch(error => alert("Profile " + error.status + ": " + error.message))
		this.setState({ friend: true })
	}
	
	async removeFriend(dispatch: any, token: string) {
		await axios("http://localhost:3000/user/removeFriend/" + this.props.currentUser.id + "/" + this.state.userId,
	        {method:'put', withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
			.then(response => {
				dispatch(setCredentials({
					user: response.data,
					accessToken: token
				}))
				return (response.data)
			})
			.catch(error => alert("Profile " + error.status + ": " + error.message))
		this.setState({ friend: false })
	}

	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<Container
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
					maxWidth="lg"
				>
					<Stack
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '15vh',
							width: '15vh',
							minHeight: '100px',
							minWidth: '100px'
						}}
						direction="row"
						spacing={2}
					>
						<Box sx={{ minWidth: '100%', minHeight: '100%', width: '80%', height: '80%' }}>
					  		<BadgeAvatar username={this.props.username} avatar={this.props.avatar} />
					  	</Box>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
		  					<Stack direction="column" spacing={1}>
								<Typography variant="h4">
									{this.props.username}
								</Typography>
								{	this.props.currentUser.id === Number(this.state.userId)
									?	(<Stack direction="row" spacing={1} />)
									:	!this.state.friend
									?	(<Stack direction="row" spacing={1}>
											<Box sx={{ minWidth: '105px', display: 'flex', alignItems: 'center' }}>
									 			<Button
													variant="contained"
													size="small"
													onClick={() => {
														this.addFriend(this.props.dispatch, this.props.token);
													}}
												>
													Add friend
												</Button>
									 		</Box>
		  							 	</Stack>)
									:	(<Stack direction="row" spacing={1}>
											<Box sx={{ minWidth: '135px', display: 'flex', alignItems: 'center' }}>
									 			<Button
													variant="contained"
													size="small"
													color="error"
													onClick={() => {
														this.removeFriend(this.props.dispatch, this.props.token)
													}}
												>
													Remove friend
												</Button>
									 		</Box>
		  							 	</Stack>)
								}
		  					</Stack>
		  				</Box>
		  			</Stack>
		  		</Container>
    		</React.Fragment>
		);
	}
}

export default PlayerInfosHook(PlayerInfos);
