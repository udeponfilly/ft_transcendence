import Router from "../Router/Router"
import './App.css'
import {AlertProvider} from "../Contexts/AlertContext"
import {InvitationProvider} from "../Contexts/InvitationContext"

function App() {
	return (
		<div className="App">
			<AlertProvider>
			<InvitationProvider>
				<Router />
			</InvitationProvider>
			</AlertProvider>
		</div>
	);
}

export default App;
