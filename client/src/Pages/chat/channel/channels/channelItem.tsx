import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import '../../chat.css'
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import { StyledBadge, getProfile, getDmUser, getLastMsg } from '../../utils';
import { Channel, ChatState, userProfile } from '../../stateInterface';
import ChatCommands from '../../chatCommands';
import useAlert from "../../../../Hooks/useAlert";
import { useSelector } from "react-redux"
import { selectUserlist } from '../../../../Hooks/userListSlice'

function getChanName(userList: userProfile[], chan: Channel, user: any) {
  if (chan.type !== 'dm')
    return (chan.title);
  return (getDmUser(userList, chan, user)?.username);
}

function ItemContent(props: {chan: any, lastMsg: any, state: ChatState, hooks: any}) {
  const chanName    = getChanName(props.hooks.userList, props.chan, props.hooks.user);

  return (
    <>
      <ListItemText
            primary={chanName}
            secondary={
              <React.Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                 {getProfile(useSelector(selectUserlist).userList, props.lastMsg?.author?.id)?.username}
                </Typography>
                <span> </span>
                  {props.lastMsg?.content?.substring(0, 15)}
                  {props.lastMsg?.content?.length && props.lastMsg?.content?.length > 15 ? <>...</> : <span>&nbsp;</span>}
                
              </React.Fragment>
            }
            />
          {props.chan.type === 'private' ? <span> <LockIcon sx={{ padding: '5%', marginTop:'10px'}} /></span> : null}
      </>
  );
}

function DmItemAvatar(props: {chan: any, user: any, userList: any}) {
  let dmUser        = getDmUser(props.userList, props.chan, props.user);
  let isConnected   = getProfile(useSelector(selectUserlist).userList, dmUser?.id)?.status === 'online' ? true : false;
  
  return (
      <>
          {
            isConnected ? 
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                  <Avatar alt={dmUser?.username?.valueOf()} src={dmUser?.avatar.valueOf()} /> 
              </StyledBadge>
            : <Avatar alt={dmUser?.username?.valueOf()} src={dmUser?.avatar.valueOf()} />
          }
      </>
  ); 
}


export function ChannelItem(chan: Channel, props: any, hooks: any) {
  let lastMsg       = getLastMsg(props.state, chan, hooks.user);
  let bckgColor     = props.state.openedConvID === chan.id ? '#ebf2fa' : 'white';

  return (
    <>
      <ListItem 
        onClick={event => {props.openConvHandler(chan.id)}} 
        alignItems="flex-start" 
        className="ChannelItem"
        sx={{backgroundColor: bckgColor, width: '94%'}}>
          <ListItemAvatar>
            {
              chan.type === 'dm' ? 
                <DmItemAvatar chan={chan} user={hooks.user} userList={hooks.userList} />
              : <Avatar alt={chan.title.valueOf()} src="-" />
            }
          </ListItemAvatar>
          <ItemContent chan={chan} lastMsg={lastMsg} state={props.state} hooks={hooks} />
      </ListItem>
          
    </>
  )
}

export function NotJoinedChanItem(props: any) {
  const lastMsg         = props.chan?.Message?.slice(-1);
  const { setAlert }    = useAlert();
  const [open, setOpen] = React.useState(false);
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const joinChan = async (e: any) => {
    e.preventDefault()
    let pwd = "";

    if (e.target.password)
      pwd = e.target.password.value;
    
    let errorLog: string | undefined = await ChatCommands("/join " + pwd, props.props.state, props.hooks.userList,  
      {chanId: props.chan.id, openConvHandler: props.props.openConvHandler}, props.hooks.token, props.hooks.user);
    if (!errorLog)
      return ;
    errorLog.substring(0, 5) === "Error" ? setAlert(errorLog, "error") : setAlert(errorLog, "success");
  }

  return (
  <div>
      <ListItem onClick={handleClickOpen} 
        alignItems="flex-start" 
        className="ChannelItem" 
        sx={{width: '94%'}}>
          <ListItemAvatar>
            <Avatar alt={props.chan.title} src="-" />
          </ListItemAvatar>
          <ItemContent chan={props.chan} lastMsg={lastMsg} state={props.props.state} hooks={props.hooks} />
      </ListItem>

      <form  onSubmit={(e) => {joinChan(e)}}>
          <Dialog open={open} onClose={handleClose} disablePortal>
    
            <DialogTitle>Join "{props.chan.title}" Channel ?</DialogTitle>
    
            <DialogContent>
              {props.chan.type === "private" ? 
              <TextField
                autoFocus
                margin="dense"
                id="password"
                label="Password"
                type="password"
                fullWidth
                variant="standard"
                /> : null}
            </DialogContent>
    
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" onClick={handleClose}>Join</Button>
            </DialogActions>
    
          </Dialog>
      </form>

  </div>
    
  )
}
