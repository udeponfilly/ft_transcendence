import * as React from "react"
import {
	TextField,
	Box,
	Stack,
	Typography,
} from '@mui/material';
import axios from "../../Api/Axios";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

interface Props {
	token: string | null
}

function useQuery() {
	const { search } = useLocation();
  
	return React.useMemo(() => new URLSearchParams(search), [search]);
}

const ValidateJwtTfa = (qrCodeProps: Props) => {
	const [qrCodeContent, setContent] = React.useState(<></>)

	React.useEffect(() => {
		axios({
			withCredentials: true,
			url: "http://localhost:3000/auth/2fa/validate",
			method: "GET",
			headers:{
				Authorization: `Bearer ${qrCodeProps.token}`
			}
		})
		.catch(() => setContent(<Navigate to={"/login"} replace={true}></Navigate>))
	  }, [qrCodeProps]);

	return qrCodeContent
}

const TfaInputField = (qrCodeProps: Props) => {
	const [value, setValue] = React.useState("")
	const navigate = useNavigate()

	const handleChange = (e: any) => {
		setValue(e.target.value);
	}

	const keyPress = (e: any) => {
		if(e.keyCode === 13){
			axios({
				withCredentials: true,
				url: "http://localhost:3000/auth/2fa/authenticate",
				method: "POST",
				headers: {
					Authorization: `Bearer ${qrCodeProps.token}`
				},
				data: {
					twoFactorAuthenticationCode: value
				}
			})
			.then(() => navigate("/"))
			.catch(() => navigate("/login"))
		}   
	}

	return (
		<TextField
		required
		onChange={handleChange}
		onKeyDown={keyPress}
		id="outlined-required"
		label="Google 2FA Code"
		/>
	)
}

const TfaAuth = () => {
	let query = useQuery();

	if (!query.get("jwt")) 
		return (<Navigate to={"/login"} replace={true}></Navigate>)//navigate("/login"))
	return (
		<Box sx={{
			height: "100vh",
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}}>
			<ValidateJwtTfa token={query.get("jwt")}/>
			<Stack spacing={4}>
				<Typography sx={{ fontWeight: 'bold' }} variant='h5'>
					Google Authenticator:
				</Typography>
				<TfaInputField token={query.get("jwt")}/>
			</Stack>
		</Box>
	)
}

export default TfaAuth