// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
import Iconify from './Iconify';
import palette from '../../../styles/palette';
// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }: any) => ({
	margin: 'auto',
	display: 'flex',
	borderRadius: '50%',
	alignItems: 'center',
	width: theme.spacing(8),
	height: theme.spacing(8),
	justifyContent: 'center',
	marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------

StatCard.propTypes = {
	color: PropTypes.string,
	icon: PropTypes.string,
	title: PropTypes.string.isRequired,
	total: PropTypes.string.isRequired,
	sx: PropTypes.object,
};

interface WidgetProps {
	title: string,
	total: string,
	icon: string,
	color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
	sx: any,
}

export default function StatCard({ title, total, icon, color = 'primary', sx, ...other }: WidgetProps) {
	return (
		<Card
		sx={{
			py: 5,
			boxShadow: 0,
			textAlign: 'center',
			color: palette[color].darker,
			bgcolor: palette[color].lighter,
			...sx,
		}}
		{...other}
		>
		<StyledIcon
			sx={{
			color: (theme: any) => theme.palette[color].dark,
			backgroundImage: (theme: any) =>
				`linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(
				theme.palette[color].dark,
				0.24
				)} 100%)`,
			}}
		>
			<Iconify icon={icon} width={24} height={24} />
		</StyledIcon>

		<Typography variant="h3">{total ? total : "N/A"}</Typography>

		<Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
			{title}
		</Typography>
		</Card>
	);
}