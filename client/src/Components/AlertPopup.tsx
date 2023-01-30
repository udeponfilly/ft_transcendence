import { Alert } from '@mui/material';
import useAlert from '../Hooks/useAlert';

const AlertPopup = () => {
	const { text, type } = useAlert();

	if (text && type) {
		return (
			<Alert
				severity={type}
				sx={{
				position: 'absolute',
				right: 0,
				top  : 0,
				width: '100%',
				zIndex: 10,
				}}
			>
				{text}
			</Alert>
		);
	}
	else {
		return <></>;
	}
};

export default AlertPopup;