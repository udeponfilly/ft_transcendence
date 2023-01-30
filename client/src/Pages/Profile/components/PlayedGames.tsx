import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
	{
		field: 'id',
		headerName: 'ID',
		type: 'number',
		width: 70,
		align: 'center',
		headerAlign: 'center',
	},
	{
		field: 'date',
		headerName: 'Date',
		type: 'date',
		minWidth: 120,
		flex: 1,
		align: 'center',
		headerAlign: 'center',
	},
	{
		field: 'playerScore',
		headerName: 'Player Score',
		type: 'number',
		minWidth: 120,
		flex: 1,
		align: 'center',
		headerAlign: 'center',
	},
	{
		field: 'opponent',
		headerName: 'Opponent',
		minWidth: 120,
		flex: 1,
		align: 'center',
		headerAlign: 'center',
	},
	{
		field: 'opponentScore',
		headerName: 'Opponent Score',
		type: 'number',
		minWidth: 120,
		flex: 1,
		align: 'center',
		headerAlign: 'center',
	},
	{
		field: 'result',
		headerName: 'Result',
		minWidth: 120,
		flex: 1,
		align: 'center',
		headerAlign: 'center',
		renderCell: (params) => {
			let chip_color: "primary" | "warning" | "error";
			(params.value === 'Winner')
				? chip_color = "primary"
				: (params.value === 'Loser') 
					? chip_color = "error"
					: chip_color = "warning"
			return <Chip color={chip_color} label={params.value}></Chip>;
		}
	},
];

export default class PlayedGames extends React.Component<{ games: any }, {}> {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
					<Box sx={{ height: 400 }}>
					{ this.props.games ?
							(<DataGrid
								rows={this.props.games}
								columns={columns}
							/>)
					:
						("No game to display")
					}
					</Box>
			</React.Fragment>);
	}
}
