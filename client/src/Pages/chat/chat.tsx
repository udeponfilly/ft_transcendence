import ChannelDisplay from "./channel/channels/channelDisplay";
import MessageDisplay from "./message/msgDisplay/messageDisplay";
import ChatHeader from "./message/msgDisplay/chatHeader";
import SendBox from "./message/sendMsg/SendBox";
import HeaderChannels from "./channel/headerChannels";
import './chat.css'
import React from "react";
import { ChatState, Channel, Message } from "./stateInterface";
import io from "socket.io-client";
import axios from "axios";
import { getChan, userIsInChan, sortChannels } from './utils'
import { InfoDialog } from "./channel/infoDialog"
import { selectCurrentUser, setCredentials } from '../../Hooks/authSlice'
import { selectCurrentToken } from '../../Hooks/authSlice'
import { useSelector } from "react-redux"
import { useSearchParams } from 'react-router-dom';
import { store } from "../../Store/store";

export const chatSocket = io("http://localhost:3000/chat"); 

function ChatWithHook(component: any) {
  return function WrappedChat(props: any) {
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectCurrentToken);
    const [ openConv ] = useSearchParams();
    let   openConvId: number | null = Number(openConv.get("openConv"));

    return (<Chat user={user} openConv={openConvId} token={token} />)
  }
}

interface Props {
  user: any;
  openConv: number;
  token: any;
}
class Chat extends React.Component<Props, ChatState> {
  constructor(props: any) {
    super(props)
    this.openConvHandler = this.openConvHandler.bind(this)
    
    this.state = {
      openedConvID: -1,
      joinedChans: [],
      notJoinedChans: [],
      mobile: window.innerWidth < 600 ? true : false,
    };
  }
  
  /** INIT DATA **/
  async componentDidMount() {
    let ChatData = {
      openedConvID: this.props.openConv !== 0 ? this.props.openConv : -1,
      joinedChans: await this.getJoinedChans(),
      notJoinedChans: await this.getNotJoinedChans(),
      mobile: window.innerWidth < 600 ? true : false,
    }
    this.setState(ChatData);
    for (const chan of ChatData.joinedChans) 
      chatSocket.emit('joinChatRoom', chan.id)
    this.emitNewChan();
    chatSocket.emit('initTable', this.props.user.id)
  }

  async getJoinedChans(): Promise<Channel[]> {
    let joinedChans = await axios.get("http://localhost:3000/channel/joinedChannels/" + this.props.user.id, 
      {withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
      .then(response => response.data)
      .catch(error => alert("getJoinedChan " + error.status + ": " + error.message))
    sortChannels(joinedChans)
    return (joinedChans)
    }
  async getNotJoinedChans(): Promise<Channel[]> {
    let notJoinedChans = await axios.get("http://localhost:3000/channel/notJoinedChannels/" + this.props.user.id,
      {withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
      .then(response => response.data)
      .catch(error => alert("getNotJoinedChans " + error.status + ": " + error.message))
    return (notJoinedChans)
  }
  async emitNewChan() {
    if (this.props.openConv !== 0) {
      axios.get("http://localhost:3000/channel" + this.props.openConv,
        {withCredentials: true, headers: {Authorization: `Bearer ${this.props.token}`}})
        .then(response => chatSocket.emit("newChanFromClient", response.data))
        .catch()
    }
  }
    
  /** RENDERING FUNCTION */
  openConvHandler(chanID: number) {
    let ChatData = structuredClone(this.state);
  
    ChatData.openedConvID = chanID;
    this.setState(ChatData);
  }

  /** SOCKETS **/
  socketNewMsg(msg: Message) {
    let ChatData = structuredClone(this.state)
    const chan = getChan(msg.channelId, ChatData)

    chan?.Message?.push(msg)
    sortChannels(ChatData.joinedChans)
    this.setState(ChatData)
  }
  
  socketNewChan(chan: Channel) {
    let ChatData = structuredClone(this.state)

    for (let channel of this.state.joinedChans) {
      if (channel.id === chan.id)
        return ;
    }
    for (let channel of this.state.notJoinedChans) {
      if (channel.id === chan.id)
        return ;
    }
    if (userIsInChan(chan, this.props.user.id))
      ChatData.joinedChans.push(chan)
    else
      ChatData.notJoinedChans.push(chan)
    this.setState(ChatData)
  }

  socketUpdateChan(newChan: Channel) {
    let ChatData = structuredClone(this.state);
    let which;

    if (newChan.id === undefined)
      return ;
    for (let chan of ChatData.joinedChans) {
      if (chan.id === newChan.id) {
        ChatData.joinedChans.splice(ChatData.joinedChans.findIndex((chan_: Channel) => chan_.id === newChan.id), 1)
        break ;
      }
    }
    for (let chan of ChatData.notJoinedChans) {
      if (chan.id === newChan.id) {
        ChatData.notJoinedChans.splice(ChatData.notJoinedChans.findIndex((chan_: Channel) => chan_.id === newChan.id), 1)
        break ;
      }
    }
    if (userIsInChan(newChan, this.props.user.id))
      which = ChatData.joinedChans
    else
      which = ChatData.notJoinedChans
    which.push(newChan)
    if (which === ChatData.joinedChans)
      sortChannels(which)
    for (let chan of ChatData.notJoinedChans) {
      if (chan.id === this.state.openedConvID) {
        ChatData.openedConvID = -1;
        break ;
      }
    }
    this.setState(ChatData)
  }

  socketBlockFromServer(data: any) {
    let newUser = structuredClone(this.props.user);

    newUser.blacklisted.push(data);
    store.dispatch(setCredentials({user: newUser, accessToken: this.props.token}));
  }

  socketUnblockFromServer(id: number) {
    let newUser = structuredClone(this.props.user);

    for (let i = 0; i < newUser.blacklisted.length; i++) {
        if (newUser.blacklisted[i].id === id) {
            newUser.blacklisted.splice(i, 1);
            break ;
        }
    }
    store.dispatch(setCredentials({user: newUser, accessToken: this.props.token}));
  }

  /** RESPONSIVE **/
  setMobile(state: ChatState) {
    let change: boolean = false;
  
    if (window.innerWidth < 600 && state.mobile === false) {
      state.mobile = true;
      change = true;
    }
    else if (window.innerWidth >= 600 && state.mobile === true) {
      state.mobile = false;
      change = true;
    }
    if (change)
      this.setState(state);
  }
  
  
  render() {
    chatSocket.off('updateChanFromServer').on('updateChanFromServer', (chan) => this.socketUpdateChan(chan));
    chatSocket.off('newChanFromServer').on('newChanFromServer', (chan) => this.socketNewChan(chan));
    chatSocket.off('newMsgFromServer').on('newMsgFromServer', (msg) => this.socketNewMsg(msg));
    chatSocket.off('blockFromServer').on('blockFromServer', (msg) => this.socketBlockFromServer(msg));
    chatSocket.off('unblockFromServer').on('unblockFromServer', (msg) => this.socketUnblockFromServer(msg));

    window.addEventListener('resize', () => this.setMobile(this.state));

    return (
    <div className="chatContainer">
      
      {!this.state.mobile || (this.state.mobile && this.state.openedConvID === -1) ?
        <div className="ChannelMenu">
            <HeaderChannels state={this.state} openConvHandler={this.openConvHandler} />
            <ChannelDisplay state={this.state} openConvHandler={this.openConvHandler} />
            <InfoDialog />
        </div> : null}

        {!this.state.mobile || (this.state.mobile && this.state.openedConvID !== -1) ?
        <div className="ChatDisplay">
            {this.state.openedConvID === -1 ? null : <ChatHeader state={this.state} openConvHandler={this.openConvHandler} /> }
            <div className="MessageDisplay"><MessageDisplay state={this.state} /></div>
            {this.state.openedConvID === -1 ? null : <div className="SendMessage"><SendBox state={this.state} openConvHandler={this.openConvHandler} /></div>}
        </div>: null}

    </div>
    )
  }
}
export default ChatWithHook(Chat);