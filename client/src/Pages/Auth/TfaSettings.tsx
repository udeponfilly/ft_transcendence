import * as React from "react"
import { selectCurrentUser, selectCurrentToken, setCredentials } from '../../Hooks/authSlice'
import { useSelector, useDispatch } from "react-redux"
import useAlert from "../../Hooks/useAlert";
import axios from '../../Api/Axios'
import {
	Box,
	Stack,
	Typography,
	Switch,
} from '@mui/material';

interface Props {
	token: string | null
	setAlert: any,
	currentUser: any
}

const TfaQrCode = (Props: Props) => {
	const [qrCodeContent, setContent] = React.useState(<></>)

	React.useEffect(() => {
		axios({
			withCredentials: true,
			url: `http://localhost:3000/user/tfa/${Props.currentUser.id}`,
			method: "GET",
			headers:{
				Authorization: `Bearer ${Props.token}`
			}
		})
		.then((response: any) => {
			let img = response.data
			setContent(
				<img src={img} alt="two factor authentication qr code"/>
			)
		})
		.catch(() => Props.setAlert("Failed fetch QRcode", "error"))	
	  }, [Props]);

	return qrCodeContent
}

const TfaSwitchItem = (dispatch: any,
					   token: string,
					   currentUser: any,
					   setAlert: any) => {
	const handleSwitchChange = async (e: any) => {
		e.preventDefault()
		let newUserData = {
			...currentUser,
			isTFAEnabled: e.target.checked
		}
		axios({
			withCredentials: true,
			url: `http://localhost:3000/user/tfa/${currentUser.id}`,
			method: "put",
			headers:{
				Authorization: `Bearer ${token}`
			},
			data:  {
				enableTfa: e.target.checked
			}
		})
		.then(() => {
			dispatch(setCredentials({
				user: newUserData,
				accessToken: token
			}))
			setAlert(`TFA turned ${newUserData.isTFAEnabled}`, "success")
		})
		.catch(() => setAlert("Failed Update TFA", "error"))
	}
	return (
		<Box sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}}>
			<Stack direction="row" spacing={2}>
				<Typography sx={{marginTop: 1}} variant="subtitle2" gutterBottom >
					Enable two factor authentication:
				</Typography>
				<Switch onChange={handleSwitchChange} checked={currentUser.isTFAEnabled} />
			</Stack>
		</Box>
	)
}

const TfaSettings = () => {
	const token = useSelector(selectCurrentToken)
	let currentUser = useSelector(selectCurrentUser)
	const { setAlert } = useAlert();
	const dispatch = useDispatch()

	return (
		<Box sx={{
		height: "80vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
		}}>
			<Stack spacing={4}>
				<Typography sx={{ fontWeight: 'bold' }} variant='h5'>
					Google Authenticator:
				</Typography>
				<TfaQrCode token={token} setAlert={setAlert} currentUser={currentUser}/>
				{TfaSwitchItem(dispatch, token, currentUser, setAlert)}
			</Stack>
		</Box>
	)
}

export default TfaSettings