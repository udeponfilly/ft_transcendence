import { getChan, isBlocked, getDmUser, isAdmin, isBlacklisted } from "../../utils";
import ChatCommands from "../../chatCommands";
import useAlert from "../../../../Hooks/useAlert";
import * as chatIcons from './chatIcons'
import { useNavigate } from "react-router-dom";
import '../../chat.css'
import { ChatState, User } from "../../stateInterface";
import { useSelector } from "react-redux"
import { selectUserlist } from '../../../../Hooks/userListSlice'
import { selectCurrentToken, selectCurrentUser } from '../../../../Hooks/authSlice'
import { Avatar } from "@mui/material";

function isAvailableForGame(currentUser: any, dmUser: any, userList: any): boolean {
  let userStatus = userList.find((user: any) => user.id === currentUser.id).status;

  if (dmUser && dmUser.status === "online" && userStatus === "online")
    return (true);
  return (false);
}

function RightDmHeader(props: {state: ChatState, dmUser: User, chatCmd: any}) {
  const user      = useSelector(selectCurrentUser);
  const userList  = useSelector(selectUserlist).userList;
  return (
    <>
    {
      isBlocked(user, props.dmUser) ? 
        <chatIcons.ChatUnblockIcon chatCmd={props.chatCmd} user={props.dmUser.username} />
        : (
            <>
              {
                isBlacklisted(props.dmUser?.id, user) || !isAvailableForGame(user, props.dmUser, userList) ? null :
                  <chatIcons.ChatGameIcon id={props.dmUser?.id} />
              }
              <chatIcons.ChatBlockIcon chatCmd={props.chatCmd} user={props.dmUser.username} />
            </>
          )        
    }
    </>
  );
}

function RightChanHeader(props: {chan: any, chatCmd: any}) {
  return (
      <>
        <chatIcons.ChatULeaveIcon chatCmd={props.chatCmd} />
      </>
  );
}

function LeftDmHeader(props: {dmUser: any, state: ChatState}) {
  const navigate = useNavigate();
  let profileLink = "/profile?userId=" + props.dmUser?.id.toString();

  return (
    <>
        <Avatar src={props.dmUser.avatar} alt={props.dmUser.username} 
                sx={{ width: 26, height: 26, marginLeft: '10px' }} />
        <div style={{ marginLeft: "15px", marginTop: '3px' }}>
            <span onClick={() => navigate(profileLink)} style={{ cursor: "pointer", marginRight: "10px" }}>
                {props.dmUser.username}
            </span>
            {" "}
        </div>
    </>
  )
}

function LeftChanHeader(props: {chan: any, state: ChatState}) {
  const user = useSelector(selectCurrentUser);
  
  return (
  <>
      <div style={{ marginLeft: "15px", marginTop: '3px' }}>
        <span style={{ marginRight: "10px" }}>
          {props.chan.title}
        </span>{" "}
      </div>
      <div style={{ marginTop: '3px' }}>
        {
          props.chan?.ownerId === user.id ?
            <chatIcons.ChatOwnerIcon /> : null
        }
        {
          isAdmin(user.id, props.chan) ?
            <chatIcons.ChatAdminIcon /> : null
        }
      </div>
  </>
  );
}

export default function ChatHeader(props: any) {
  const { setAlert }  = useAlert();
  const chan          = getChan(props.state.openedConvID, props.state); 
	const userList 		  = useSelector(selectUserlist).userList;
  const user          = useSelector(selectCurrentUser);
  const token         = useSelector(selectCurrentToken);
  let   dmUser: any   = getDmUser(userList, chan, user);
  
  if (chan === undefined) return <div></div>;

  const chatCmd = async (cmd: string) => {
    let errorLog: string | undefined = await ChatCommands(
      cmd,
      props.state,
      userList,
      { chanId: chan.id, openConvHandler: props.openConvHandler },
      token,
      user
    );

    if (errorLog)
      errorLog.substring(0, 5) === "Error" ? setAlert(errorLog, "error") : setAlert(errorLog, "success");
  };

  return (
    <div className="ChatHeader">
        <div className="leftChatHeader">
            { props.state.mobile && <chatIcons.ChatGobackIcon openConvHandler={props.openConvHandler} /> }    
            
            {
                chan.type === 'dm' ?
                <LeftDmHeader dmUser={dmUser} state={props.state} />
              : <LeftChanHeader chan={chan} state={props.state} />
            }

        </div>

        <div>
          {
            chan.type === 'dm' ?
              <RightDmHeader state={props.state} dmUser={dmUser} chatCmd={chatCmd} />
            : <RightChanHeader chan={chan} chatCmd={chatCmd} />
          }
        </div>
    </div>
  );
}
