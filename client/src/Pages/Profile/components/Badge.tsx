import * as React from 'react';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

interface Props {
	username: string;
	avatar: string;
}

export default class BadgeAvatar extends React.Component<Props, {}> {

	render() {
		return (
		    <Badge
				overlap="circular"
		    	anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		    	variant="dot"
				sx={{ width: '100%', height: '100%' }}
		    >
				<Avatar
					alt={this.props.username}
		  			src={this.props.avatar}
		  			sx={{ width: '100%', height: '100%' }}
				/>
		    </Badge>
		);
	}
}
