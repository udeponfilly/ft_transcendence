import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import './Login.css'

function Login() {
	const content = (
			<div className="loginPage">
				<Container component="main" maxWidth="xs">
					<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						backgroundColor: '#f5f3f2',
						padding: '40px',
						borderRadius: '30px',
					}}
					>
					<h1>TRANSCENDENCE</h1>
					<Button variant="contained" href='http://localhost:3000/auth/42' style={{marginTop: '20px'}}>
						42 Login
					</Button>
					</Box>
				</Container>
			</div>
		)

  return content
}

export default Login;