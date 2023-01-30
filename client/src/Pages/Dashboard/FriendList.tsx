import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
import { Avatar, Box, List, ListItemText, Badge, BadgeProps } from '@mui/material';
import { StyledFriendItem } from './FriendListStyle';
import { Stack } from '@mui/system';
import { userProfile } from '../chat/stateInterface';
import { styled } from '@mui/material/styles';

interface FriendSectionProps { 
	data: userProfile[],
}

FriendSection.propTypes = {
  data: PropTypes.array,
};

export default function FriendSection(friendSectionProps: FriendSectionProps) {
  return (
    <Box>
      <List disablePadding sx={{ p: 1 }}>
        {friendSectionProps.data.map((item: userProfile) => (
          <FriendList key={item.username} item={item} />
        ))}
      </List>
    </Box>
  );
}


FriendList.propTypes = {
  item: PropTypes.object,
};

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
	'& .MuiBadge-badge': {
	  right: -3,
	  top: 10,
	  padding: '10 10px',
	},
}));

function FriendList({ item }: any) {
	let { username, avatar, id, status } = item;

	username = `${username.substring(0, 11)}${username.length <= 11 ? "" : "..."}`
	return (
		<StyledFriendItem
		component={RouterLink}
		to={`profile?userId=${id}`}
		sx={{
			padding: "20px",
			'&.active': {
			color: 'text.primary',
			bgcolor: 'action.selected',
			fontWeight: 'fontWeightBold',
			},
		}}
		>
			<Stack direction="row" spacing={2}>
				{status === "offline"
					? <StyledBadge color="error" badgeContent="" variant="dot"></StyledBadge>
					: <StyledBadge color="success" badgeContent="" variant="dot"></StyledBadge>
				} 
				<Avatar
				src={avatar}
				alt="photoURL"
				sx={{ width: 20, height: 20 }}
				/>		
				<ListItemText disableTypography primary={username} />
			</Stack>
		</StyledFriendItem>
	);
}
