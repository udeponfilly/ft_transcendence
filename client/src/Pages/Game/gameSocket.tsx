import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../Hooks/authSlice";
import io, { Socket } from "socket.io-client";

export default function useSocket(): Socket {
  const userId = useSelector(selectCurrentUser).id;
  const socket: Socket = io("http://localhost:3000/game", {
    auth: {
      id: userId,
    },
  });
  return socket;
}
