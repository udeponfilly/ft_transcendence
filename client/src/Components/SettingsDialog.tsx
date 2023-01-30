import * as React from 'react';
import {
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	DialogTitle,
	Dialog,
	TextField,
	MenuItem,
	ListItemIcon,
	Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { selectCurrentUser, selectCurrentToken, setCredentials } from '../Hooks/authSlice'
import { useSelector, useDispatch } from "react-redux"
import useAlert from "../Hooks/useAlert";
import { AvatarUpload } from './AvatarUpload';
import axios from 'axios';
import { usersStatusSocket } from "../Router/Router";

export interface SimpleDialogProps {
	open: boolean;
	onClose: (value: string) => void;
}

const uploadFile = (file: any, currentUser: any, token: string) => {
	const formDataFile = new FormData();
	formDataFile.append('file', file, currentUser.login)
	return axios({
		withCredentials: true,
		url: `http://localhost:3000/user/upload/avatar/${currentUser.id}`,
		method: "put",
		headers: {
			Authorization: `Bearer ${token}`
		},
		data: formDataFile
	})
}

const updateUsername = (username: string, currentUser: any, token: string) => {
	return axios({
		withCredentials: true,
		url: `http://localhost:3000/user/${currentUser.id}`,
		method: "put",
		headers: {
			Authorization: `Bearer ${token}`
		},
		data: {
			username: username
		}
	})
}

function SimpleDialog(props: SimpleDialogProps) {
	let currentUser = useSelector(selectCurrentUser)
	const token = useSelector(selectCurrentToken)
	const { onClose, open } = props;
	const [username, setMessage] = React.useState(currentUser.username);
	const { setAlert } = useAlert();
	const [file, setFile] = React.useState<any>();
	const dispatch = useDispatch()

	const handleMessageChange = (event: any) => {
		setMessage(event.target.value);
	};

	const handleClose = () => {
		onClose(username)
	};

	const onFileChange = (file: React.ChangeEvent) => {
		const { files } = file.target as HTMLInputElement;
		if (files && files.length !== 0) {
			setFile(files[0])
		}
	}

	const handleSubmit = async (e: any) => {
		e.preventDefault()
		let newUserData = { ...currentUser }
		if (username.indexOf(' ') !== -1) {
			setAlert("Username should not contain white space", "error")
			return
		}
		if (file) {
			await uploadFile(file, currentUser, token)
				.then((req: any) => {
					if (req.status === 200) {
						newUserData.avatar = `${req.data.avatar}?${Date.now()}`
						dispatch(setCredentials({
							user: newUserData,
							accessToken: token
						}))
						usersStatusSocket.emit('updateAvatar', newUserData)
					}
					return req
				})
				.catch(() => setAlert("Failed Upload File", "error"))
		}
		if (username.length && username !== currentUser.username) {
			await updateUsername(username, currentUser, token)
				.then((req: any) => {
					let newUserDataUpload = { ...newUserData }
					if (req.status === 200) {
						newUserDataUpload.username = req.data.username
						dispatch(setCredentials({
							user: newUserDataUpload,
							accessToken: token
						}))
						usersStatusSocket.emit('updateUsername', username)
					}
					return req
				})
				.catch((err) => setAlert(`Failed updating username`, "error"))
		}
		handleClose()
	}

	return (
		<Dialog onClose={handleClose} open={open}>
			<form onSubmit={e => e.preventDefault()}>
				<DialogTitle sx={{ width: '300px' }}>Settings</DialogTitle>
				<List sx={{ pt: 0 }}>
					<ListItem>
						<ListItemAvatar>
							<AvatarUpload onChange={onFileChange} avatarSrc={currentUser.avatar} />
						</ListItemAvatar>
					</ListItem>
					<br />
					<ListItem>
						<TextField
							type="text"
							id="username"
							name="username"
							label="update username"
							onChange={handleMessageChange}
							value={username}
						/>
						<br />
					</ListItem>
					<br />
					<ListItem>
						<Button onClick={handleSubmit} variant="contained" disableElevation>
							update changes
						</Button>
					</ListItem>
				</List>
			</form>
		</Dialog>
	);
}

export default function SettingsDialog() {
	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = (value: string) => {
		setOpen(false);
	};

	usersStatusSocket
		.off("firstConnectionFromServer")
		.on("firstConnectionFromServer", () => setOpen(true));

	return (
		<div>
			<MenuItem onClick={handleClickOpen}>
				<ListItemIcon>
					<SettingsIcon />
				</ListItemIcon>
				<ListItemText>Settings</ListItemText>
			</MenuItem>
			<SimpleDialog
				open={open}
				onClose={handleClose}
			/>
		</div>
	);
}