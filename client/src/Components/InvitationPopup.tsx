import { useState } from "react";
import { Dialog, DialogContent, DialogContentText, DialogActions,Button } from '@mui/material';
import { usersStatusSocket } from "../Router/Router";
import { useNavigate } from "react-router-dom";

const InvitationPopup = () => {
	const navigate = useNavigate();
	const [invitation, setInvitation] = useState(false);
  
	const handleInvitePlayer = () => {
		setInvitation(true);
	};
  
	usersStatusSocket.on("invitePlayerClient", handleInvitePlayer);
  
	const handleClose = () => {
		setInvitation(false);
		usersStatusSocket.emit("declineInvitationServer");
	};
  
	const handleAccept = () => {
	  navigate("/game");
	  setInvitation(false);
	  usersStatusSocket.emit("acceptInvitationServer");
	};
  
	const handleDecline = () => {
	  setInvitation(false);
	  usersStatusSocket.emit("declineInvitationServer");
	};
	if (invitation) {
		return (
			<Dialog
			open={invitation}
			onClose={handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
			>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				A player wants to play with you
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleAccept}>Accept</Button>
			<Button onClick={handleDecline} autoFocus>
				Decline
			</Button>
			</DialogActions>
		</Dialog>
		);
	}
	else {
		return <></>;
	}
};

export default InvitationPopup;