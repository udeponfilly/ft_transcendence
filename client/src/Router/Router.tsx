import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import Login from "../Pages/Auth/Login";
import ConnectedUsers from "../Pages/Dashboard/ConnectedUsers";
import Dashboard from "../Pages/Dashboard/Dashboard";
import PrimarySearchAppBar from "../Components/TopBar";
import Game from "../Pages/Game/Game";
import Chat from "../Pages/chat/chat";
import Profile from "../Pages/Profile/Profile";
import TfaAuth from "../Pages/Auth/TfaAuth";
import TfaSettings from "../Pages/Auth/TfaSettings";
import NotFoundPage from "../Pages/Error/404";
import BadRequestPage from "../Pages/Error/400";
import PersistLogin from "../Hooks/persistLogin";
import { selectCurrentToken } from "../Hooks/authSlice";
import AlertPopup from "../Components/AlertPopup";
import InvitationPopup from "../Components/InvitationPopup";
import { selectCurrentUser } from "../Hooks/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { userProfile } from "../Pages/chat/stateInterface";
import { setUserlist } from "../Hooks/userListSlice";
import { useEffect } from "react";

export const usersStatusSocket = io("http://localhost:3000/app");

function connectGlobalSocket(user: any) {
  const userData = {
    id: user?.id,
    login: user?.login,
    username: user?.username,
    status: "online",
    avatar: user?.avatar,
  };
  if (user) {
    usersStatusSocket.emit("connection", userData);
  }
}

function OutletRoute() {
  return (
	<>
		<div>
		<PrimarySearchAppBar />
		<Outlet />
		<AlertPopup />
		<InvitationPopup />
		</div>
	</>
  );
}

function PrivateRoutes() {
  const isTokenValidated = useSelector(selectCurrentToken)
    ? "valid"
    : "invalid";
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    connectGlobalSocket(user);
  }, [user]);

  usersStatusSocket
    .off("updateStatusFromServer")
    .on("updateStatusFromServer", (userList: userProfile[]) => {
      dispatch(setUserlist(userList));
    });
  return isTokenValidated === "valid" ? (
	<OutletRoute />
  ) : (
    <Navigate to="/login" />
  );
}

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/400" element={<BadRequestPage />} />
      <Route path="/authenticator" element={<TfaAuth />} />
      <Route element={<PersistLogin />}>
        <Route path="/" element={<PrivateRoutes />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/connected-users" element={<ConnectedUsers />} />
          <Route path="/game" element={<Game />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tfa-settings" element={<TfaSettings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
