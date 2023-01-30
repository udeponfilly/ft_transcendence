import { LoadingButton } from "@mui/lab";
import { Socket } from "socket.io-client";
import { usersStatusSocket } from "../../../../Router/Router";
import "../../game.css";

function FindGameButton({
  ready,
  setReady,
  setStart,
  socket,
  customGame,
}: {
  ready: boolean;
  setReady: (value: boolean) => void;
  setStart: (value: boolean) => void;
  socket: Socket;
  customGame: boolean;
}) {
  const updateStartClient = () => {
    setStart(true);
    usersStatusSocket.emit("updateStatus", "in game");
    socket.emit("updateCustomServer", customGame);
  };

  socket.off("updateStartClient").on("updateStartClient", updateStartClient);

  function handleClick() {
    setReady(true);
    socket.emit("updateReadyServer");
    usersStatusSocket.emit("updateStatus", "waiting for game");
  }

  return (
    <>
      <div className="button">
        <LoadingButton
          variant="contained"
          loading={ready}
          size="large"
          onClick={handleClick}
        >
          FIND GAME
        </LoadingButton>
      </div>
    </>
  );
}

export default FindGameButton;
