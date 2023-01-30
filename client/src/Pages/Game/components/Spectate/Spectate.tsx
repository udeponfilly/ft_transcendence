import { usersStatusSocket } from "../../../../Router/Router";

function spectateGame(invitedPlayerId: number): void {
  usersStatusSocket.emit("spectatePlayer", invitedPlayerId);
}

export default spectateGame;
