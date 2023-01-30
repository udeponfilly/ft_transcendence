import { Button } from "@mui/material";
import { Socket } from "socket.io-client";

function LeaveButton({
  socket,
  endGame,
}: {
  socket: Socket;
  endGame: (param?: { p1Id: number; p2Id: number; playerId: number }) => void;
}) {
  const handleEndGame = (param?: {
    p1Id: number;
    p2Id: number;
    playerId: number;
  }) => {
    endGame(param);
  };

  socket.off("endGameClient").on("endGameClient", handleEndGame);

  const handleClick = () => {
    socket.emit("endGameServer");
  };

  return (
    <div className="button">
      <Button
        variant="contained"
        size="large"
        color="error"
        onClick={handleClick}
      >
        LEAVE
      </Button>
    </div>
  );
}

export default LeaveButton;
