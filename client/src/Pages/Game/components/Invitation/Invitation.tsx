import { usersStatusSocket } from "../../../../Router/Router";

function invitationGame(invitedPlayerId: number): void {
  usersStatusSocket.emit("invitePlayer", invitedPlayerId);
}

export default invitationGame;
