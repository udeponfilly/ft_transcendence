import { ChatState, Channel, User, userProfile } from "./stateInterface"
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';

export function dateToString(date: Date) {
  return (
    String(date.getDay()) 
    + "/" + String(date.getMonth()) 
    + "/" + String(date.getFullYear()) 
    + " " + String(date.getHours()) 
    + ":" + String(date.getMinutes())
  ); 
}

export function getChan(id: number, state: ChatState) {
    for (const chan of state.joinedChans) {
      if (chan.id === id)
        return chan;
    }
    return (undefined);
}

export function userIsInChan(chan: Channel, userId: number) {
    if (chan.members === undefined)
      return (false)
    for (let user of chan.members) {
      if (user.id === userId)
        return (true)
    }
    return (false)
}

export function getLastMsg(state: ChatState, chan: Channel, user: any) {
  if (!chan.Message)
    return undefined ;
  for (let i = chan.Message.length - 1; i >= 0; i--) {
    if (!isBlocked(user, chan?.Message[i].author)) {
      return chan?.Message[i];
    }
  }
  return undefined ;
}

export function sortChannels(chans: Channel[]) {
    chans.sort(function(a: any, b: any) {
        var c, d;
        if (b.Message && b.Message.length === 0)
            c = b.id
        else
            c = new Date(b.Message[b.Message.length - 1].date).getTime()
        if (a.Message.length === 0)
            d = a.id;
        else
            d = new Date(a.Message[a.Message.length - 1].date).getTime()
        return c - d;
    });
  }

  export function isBlocked(actualUser: User, otherDMUser: User) : boolean {
    if (otherDMUser === undefined || actualUser.blacklist === undefined)
      return (false);
    for (let blacklist of actualUser.blacklist) {
      if (blacklist.target_id === otherDMUser.id &&
        (blacklist.type === "block"))
        return (true);
    }
    return (false)
  }

  export function isAdmin(userId: number, chan?: Channel): boolean {
    if (chan === undefined) return false;
    for (let admin of chan.admin) {
      if (admin.id === userId) return true;
    }
    return false;
  }
  
  export function isBlacklisted(id: number, user: User) {
    if (!user.blacklisted)
      return (false);
    for (let blacklisted of user.blacklisted) {
      if (blacklisted.creatorId === id && blacklisted.type === "block")
        return (true);
    }
    return (false);
  }

  export function getDmUser(userList: userProfile[], chan: any, user: any) {
    if (!chan || chan.type !== 'dm')
      return undefined;
    if (user.id === chan.members[0].id)
      return getProfile(userList, chan.members[1].id);
    else
      return getProfile(userList, chan.members[0].id);
  }

  export const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));

  export function getProfile(tab: userProfile[], id?: number) {
    if (id === undefined)
      return null;
    for (let profile of tab) {
      if (profile.id === id)
        return profile;
    }
    return null;
  }