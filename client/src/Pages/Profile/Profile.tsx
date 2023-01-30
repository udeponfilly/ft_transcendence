import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Grid, Container, Box } from '@mui/material'
import PlayerInfos from './components/PlayerInfos'
import PlayedGames from './components/PlayedGames'
import axios from 'axios'
import { useSearchParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectCurrentToken } from '../../Hooks/authSlice'
import StatCard from "./components/StatCard"

function TrimStringMoreThanElevenChar(string: string) {
	return `${string.substring(0, 11)}${string.length <= 11 ? "" : "..."}`
}

function ProfileHook(component: any) {
	return function WrappedProfile(props: any) {
		const [searchParams] = useSearchParams()
		const userId = searchParams.get("userId")
		const token = useSelector(selectCurrentToken)
		const navigate = useNavigate()
		return (<Profile navigate={navigate} token={token} userId={userId ? userId : ""} />)
	}
}

class Profile extends React.Component<{ navigate: any, token: string, userId: string }, {}> {
	state = {
		data: {
			id: undefined,
			avatar: "",
			username: "Unknown",
			games: [],
			playedGames: "N/A",
			gamesWon: "N/A",
			gamesLost: "N/A",
			winRate: -1,
		},
		userId: this.props.userId
	};

	async componentDidMount() {
		await axios.get("http://localhost:3000/user/stats/" + this.state.userId,
			{withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
			.then(response => response.data)
			.then(Profile => { this.setState({ data: Profile }); })
			.catch(error => (error.response.status === 404) ? this.props.navigate("/404") : this.props.navigate("/400"))
	}

	async componentDidUpdate(prevProps: any) {
		if (prevProps.userId !== this.props.userId) {
			await axios.get("http://localhost:3000/user/stats/" + this.props.userId,
			{withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
				.then(response => response.data)
				.then(Profile => { this.setState({ data: Profile, userId: this.props.userId }); })
				.catch(error => alert("Profile " + error.status + ": " + error.message))
		}
	}

	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<div >
					<Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
						<Container maxWidth="lg" sx={{ mt: 6, margin: "0px" }}>
							<Grid container spacing={3}>
								<Grid item xs={12} sm={12} md={12}>
									<PlayerInfos
										username={TrimStringMoreThanElevenChar(this.state.data.username)}
										avatar={this.state.data.avatar}
										userId={this.state.userId}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<StatCard
										title="Games played"
										total={String(this.state.data.playedGames)}
										icon={'ant-design:check-circle-filled'}
										sx={{ borderRadius: "10px" }}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<StatCard
										title="Games won"
										total={String(this.state.data.gamesWon)}
										color="success"
										icon={'ant-design:trophy-filled'}
										sx={{ borderRadius: "10px" }}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<StatCard
										title="Games lost"
										total={String(this.state.data.gamesLost)}
										color="error"
										icon={'ant-design:frown-filled'}
										sx={{ borderRadius: "10px" }}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<StatCard
										title="Win rate"
										total={this.state.data.winRate !== -1 ? String(this.state.data.winRate) + "%" : "N/A"}
										color="warning"
										icon={'ant-design:fund-filled'}
										sx={{ borderRadius: "10px" }}
									/>
								</Grid>
								<Grid item xs={12} md={18} lg={18}>
									<PlayedGames
										games={this.state.data.games}
									/>
								</Grid>
							</Grid>
						</Container>
					</Box>
				</div>
    		</React.Fragment>
		);
	}
}

export default ProfileHook(Profile);
