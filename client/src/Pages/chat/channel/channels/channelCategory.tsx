import { ChannelItem, NotJoinedChanItem } from './channelItem';
import '../../chat.css'
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectCurrentUser } from '../../../../Hooks/authSlice';
import { selectUserlist } from '../../../../Hooks/userListSlice';

function getAllChans(props: any, chanArray: any, joined: boolean, hooks: any) {
  return (
    <div>
    {
        chanArray.map((chan: any) => (
          <div key={chan.id}>
            {joined ? ChannelItem(chan, props, hooks): <NotJoinedChanItem chan={chan} props={props} hooks={hooks} />}
          </div>
      ))
    }
    </div>
  );
}

export default function ShowChannelItems(type: String, props: any) {    
  const hooks = {
    userList: useSelector(selectUserlist).userList,
    user: useSelector(selectCurrentUser),
    token: useSelector(selectCurrentToken),
  }

  switch (type) {
    case 'dm' :
      return getAllChans(props, props.state.joinedChans.filter((chan: any) => chan.type === 'dm'), true, hooks);
    case 'joined' :
      return getAllChans(props, props.state.joinedChans.filter((chan: any) => chan.type !== 'dm'), true, hooks);
    case 'all' :
      return getAllChans(props, props.state.notJoinedChans, false, hooks);
    default :
      return
  }

}