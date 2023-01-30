import React from 'react';
import { ChatState, userProfile } from '../stateInterface'
import axios from 'axios';
import useAlert from "../../../Hooks/useAlert";
import { useSelector } from "react-redux"
import { selectUserlist } from '../../../Hooks/userListSlice'
import { chatSocket } from '../chat';
import { selectCurrentUser } from '../../../Hooks/authSlice'
import { selectCurrentToken } from '../../../Hooks/authSlice'

function getUserListWithoutDm(state: ChatState, usersList: userProfile[], user: any) {
  let userList  = structuredClone(usersList);
  let dmList    = [];

  for (let chan of state.joinedChans) {
    if (chan.type === "dm") {
      if (chan.members[0].id === user.id)
        dmList.push(structuredClone(chan.members[1]));
      else
        dmList.push(structuredClone(chan.members[0]));
    }
  }
  for (let i = userList.length - 1; i >= 0; i--) {
    if (userList[i].id === user.id)
      userList.splice(i, 1);
    for (let dmUser of dmList) {
      if (userList[i] && (dmUser.id === userList[i].id)) 
        userList.splice(i, 1);
    }
  }
  return (userList);
}

function isInUserList(userList: any, username: any) {
  for (let user of userList) {
      if (user.username === username)
          return (user.id);
  }
  return (-1);
}

async function createChan(newChan: {user1: number, user2: number}, props: any, token: any) {
  axios.post('http://localhost:3000/channel/newDM/', newChan, 
  {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
  .then(response => {
    chatSocket.emit("newChanFromClient", response.data); 
    props.openConvHandler(response.data.id);
    })
  .catch(error => alert("Error sending DM.")) 
}

export default function SearchBar(props: any) {
    const { setAlert }  = useAlert();
    const user          = useSelector(selectCurrentUser);
    const token          = useSelector(selectCurrentToken);
    let   userList      = getUserListWithoutDm(props.state, useSelector(selectUserlist).userList, user);

    const newDM = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget);
      let   otherUserId: number = isInUserList(userList, data.get('username'));
      
      otherUserId === -1 ?
          setAlert(data.get('username') + " can't be found or is already in your dms.", "error")
        : createChan({user1: user.id, user2: otherUserId}, props, token);
      e.currentTarget.reset();
    } 

    return (
        <div className="searchBar">
            <form  onSubmit={(e) => {newDM(e)}}>
                <input id="searchQueryInput" type="text" name="username" placeholder="Search username" autoComplete='off' />
            </form>
        </div>
    );
}