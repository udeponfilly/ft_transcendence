import { ChatState, userProfile } from './stateInterface'
import axios from 'axios';
import { getChan } from './utils';
import { chatSocket } from './chat';
import { store } from '../../Store/store';
import { setCredentials } from '../../Hooks/authSlice';

const commands = new Map([
    ["/join", JoinChan],
    ["/leave", LeaveChan],
    ["/setpwd", SetPwd],
    ["/rmpwd", RmPwd],
    ["/addadmin", AddAdmin],
    ["/block", Block],
    ["/unblock", Unblock],
    ["/ban", Ban],
    ["/mute", Mute],
    ["/block", Block],
    ["/unblock", Unblock],
]);

function getId(userList: any[], username: string): number {
    for (let user of userList) {
        if (user.username === username)
            return user.id;
    }
    return (-1);
}

// handler
export default async function ChatCommands(input: string, state: ChatState, userList: userProfile[], params: any, token: any, user: any)
    : Promise<string | undefined> 
{
    let inputs = input.split(' ', 3);
    let func = commands.get(inputs[0])

    if (func !== undefined) {
        let errorLog: string = await func(inputs, state, userList, params, token, user)
            .then((response) => response)
        if (errorLog === "")
            return undefined;
        return (errorLog);
    }
    return undefined;
}

/** CHAT COMMANDS */

async function JoinChan(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    chatSocket.emit('joinChatRoom', params.chanId);
    const chan = getChan(params.chanId, state);
    
    if (chan?.type === 'dm')
        return "";
    if (chan?.type === "private" && inputs.length <= 1)
        return "Error: Please enter a password.";

    let ret = await axios.post("http://localhost:3000/channel/Member/", 
        {channelId: params.chanId, memberId: user.id, pwd: inputs[1]}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => {chatSocket.emit('updateChanFromClient', response.data); return response.data})
        .catch((error) => "error")
    if (ret === "error")
        return "Error: Can't access this channel.";
    params.openConvHandler(ret.id);
    return "Chan joined.";
}

async function LeaveChan(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    chatSocket.emit('leaveChatRoom', params.chanId)
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm')
        return "";

    let ret = await axios.delete("http://localhost:3000/channel/Member/",
        {
            data: {
                channelId: params.chanId,
                memberId: user.id,
                authorId: user.id
            },
            withCredentials: true, 
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => chatSocket.emit('updateChanFromClient', response.data))
        .catch(() => "error") 
    params.openConvHandler(-1);
    if (ret === "error")
        return "Error: Chan already left.";
    return "Chan left.";
}

async function SetPwd(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm' || inputs.length === 1)
        return "";

    let ret = await axios.post("http://localhost:3000/channel/setPwd/", 
        {pwd: inputs[1], channelId: params.chanId, userId: user.id}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => chatSocket.emit('updateChanFromClient', response.data))
        .catch(error => "error") 
    if (ret === "error")
        return "Error: You don't have the rights.";
    return "Password successfully set.";
}

async function RmPwd(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm')
        return "";

    let ret = await axios.post("http://localhost:3000/channel/setPwd/", 
        {pwd: "", channelId: params.chanId, userId: user.id}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => chatSocket.emit('updateChanFromClient', response.data))
        .catch(error => "error") 
    if (ret === "error")
        return "Error: You don't have the rights.";
    return "Password successfully removed.";
}

async function AddAdmin(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan?.type === 'dm' || inputs.length === 1 || chan === undefined)
        return "";

    let adminId = getId(userList, inputs[1]);
    for (let user of chan?.members) {
        if (user.id === adminId) {
            adminId = user.id;
            break ;
        }
    }
    if (adminId === -1)
        return "Error: " + inputs[1] + " is not part of the channel.";

    let ret = await axios.post("http://localhost:3000/channel/addAdmin/", 
        {adminId: adminId, chanId: params.chanId, userId: user.id}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => chatSocket.emit('updateChanFromClient', response.data))
        .catch(error => "error") 
    if (ret === "error")
        return "Error: You don't have the rights.";
    return "User " + inputs[1] + " successfully added as administrator.";
}

function addBlacklistRedux(user: any, token: any, data: any) {
    let newUser = structuredClone(user);

    newUser.blacklist.push(data);
    store.dispatch(setCredentials({user: newUser, accessToken: token}));
}

async function Block(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (chan === undefined)
        return "";
    if (inputs.length === 1 && chan.type === 'dm') {
        if (chan.members[0].id === user.id)
            inputs = [inputs[0], chan.members[1].username.valueOf()]
        else
           inputs = [inputs[0], chan.members[0].username.valueOf()]
    }
    let blockedId = getId(userList, inputs[1]);
    for (let user of chan?.members) {
        if (user.id === blockedId) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1)
        return "Error: " + inputs[1] + " is not part of the channel.";
    if (blockedId === user.id)
        return "";
    let ret = await axios.post("http://localhost:3000/blacklist", 
        {target_id: blockedId, type: "block", channelId: params.chanId, creatorId: user.id}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => response.data)
        .catch(error => "error");
    if (ret === "error")
        return "Error: User already blocked.";
    addBlacklistRedux(user, token, ret);
    chatSocket.emit('blockFromClient', ret);
    return "User successfully blocked.";
}

function removeBlacklistRedux(user: any, token: any, id: number) {
    let newUser = structuredClone(user);

    for (let i = 0; i < newUser.blacklist.length; i++) {
        if (newUser.blacklist[i].id === id) {
            newUser.blacklist.splice(i, 1);
            break ;
        }
    }
    store.dispatch(setCredentials({user: newUser, accessToken: token}));
}

async function Unblock(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const   chan = getChan(params.chanId, state);
    let     blacklistId = -1;
    
    if (chan === undefined || user.blacklist === undefined)
        return "";
    if (inputs.length === 1 && chan.type === 'dm') {
        if (chan.members[0].id === user.id)
        inputs = [inputs[0], chan.members[1].username.valueOf()]
        else
        inputs = [inputs[0], chan.members[0].username.valueOf()]
    }

    let     blockedId = getId(userList, inputs[1]);
    for (let user of chan?.members) {
        if (user.id === blockedId) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1)
        return "Error: " + inputs[1] + " is not part of the channel.";
    for (let blacklist of user.blacklist) {
        if (blacklist.target_id === blockedId)
            blacklistId = blacklist.id;
    }
    if (blacklistId === -1)
        return "Error: User not blocked.";
    let ret = await axios.delete("http://localhost:3000/blacklist/" + blacklistId, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then(response => response.data)
        .catch(error => "error");
    if (ret === "error")
        return "Error: User not blocked.";
    removeBlacklistRedux(user, token, ret.id);
    chatSocket.emit('unblockFromClient', ret);
    return "User successfully unblocked.";
}

async function Ban(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (inputs.length === 2)
        inputs = [inputs[0], inputs[1], "0"];
    if (inputs.length < 3 || chan === undefined || isNaN(Number(inputs[2])))
        return "";
    let blockedId = getId(userList, inputs[1]);;
    for (let user of chan?.members) {
        if (user.id === blockedId) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1)
        return "Error: " + inputs[1] + " is not part of the channel."
    if (blockedId === user.id)
        return "";

    let isError = await axios.post("http://localhost:3000/blacklist", 
        {target_id: blockedId, type: "ban", delay: inputs[2], channelId: params.chanId, creatorId: user.id}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then()
        .catch(error => "error");
    if (isError === "error")
        return "Error: You don't have the rights.";
    axios.delete("http://localhost:3000/channel/Member/", {
            data: {
                channelId: params.chanId, 
                memberId: blockedId,
                authorId: user.id
            },
            withCredentials: true, 
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
        .then(response => chatSocket.emit('updateChanFromClient', response.data))
        .catch(error => alert(error.status + ": " + error.message)) 
    chatSocket.emit('banFromClient', {bannedId: blockedId, chanId: params.chanId});
    return "User " + inputs[1] + " successfully banned for " + inputs[2] + " minutes.";
}

async function Mute(inputs: string[], state: ChatState, userList: userProfile[], params: any, token: any, user: any) : Promise<string> {
    const chan = getChan(params.chanId, state);
    if (inputs.length < 3 || chan === undefined || isNaN(Number(inputs[2])))
        return "";
    let blockedId = getId(userList, inputs[1]);
    for (let user of chan?.members) {
        if (user.id === blockedId) {
            blockedId = user.id;
            break ;
        }
    }
    if (blockedId === -1)
        return "Error: " + inputs[1] + " is not part of the channel." 
    if (blockedId === user.id)
        return "";
    
    let isError = await axios.post("http://localhost:3000/blacklist", 
        {target_id: blockedId, type: "mute", delay: inputs[2], channelId: params.chanId, creatorId: user.id}, 
        {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        .then()
        .catch(error => "error");
    if (isError === "error")
        return "Error: You don't have the rights.";
    return "User " + inputs[1] + " successfully muted for " + inputs[2] + " minutes.";
}
