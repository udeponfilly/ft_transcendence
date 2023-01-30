import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import ChatCommands from '../../chatCommands'
import useAlert from "../../../../Hooks/useAlert";
import { getChan } from '../../utils';
import { useSelector } from "react-redux"
import { selectUserlist } from '../../../../Hooks/userListSlice'
import { chatSocket } from '../../chat';
import { selectCurrentToken, selectCurrentUser } from '../../../../Hooks/authSlice';

export default function SendBox(props: any) {
  const { setAlert }  = useAlert();
	const userList 		  = useSelector(selectUserlist).userList;
  const user          = useSelector(selectCurrentUser);
  const token         = useSelector(selectCurrentToken);

  const newMessage = async (value: String) => {
      const chan = getChan(props.state.openedConvID, props.state)
      const newMsg = {
        channelId: chan?.id,
        authorId:  user.id,
        content:   value,
      }
      axios.post("http://localhost:3000/message", newMsg, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => chatSocket.emit("newMsgFromClient", {room: "chat" + chan?.id, message: response.data}))
        .catch(error => setAlert("You've been blocked or mute.", "error")) 
  }

  const chatCmd = async (value: string) => {
    let errorLog: string | undefined = await ChatCommands(value, props.state, userList,  
      {chanId: props.state.openedConvID, openConvHandler: props.openConvHandler}, token, user);
    if (!errorLog)
      return ;
    errorLog.substring(0, 5) === "Error" ? setAlert(errorLog, "error") : setAlert(errorLog, "success");
  }

  const onKeyPress = (e: any) => {
    if (e.key !== 'Enter')
      return ;
    const target = e.target as HTMLInputElement
    const value: string = target.value
    
    target.value = ""
    if (!value.length) 
      return ;
    value[0] === '/' ? chatCmd(value) : newMessage(value);
  }

  return (
    <Box>
      <TextField
        onKeyPress={(e) => onKeyPress(e)} 
        fullWidth id="fullWidth" 
        autoFocus
        sx={{background: 'white'}} />
    </Box>
  );
}