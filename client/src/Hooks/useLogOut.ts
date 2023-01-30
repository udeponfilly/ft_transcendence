import { logOut } from './authSlice'
import axios from "axios";

export const useLogOut = () => {
	axios.post("http://localhost:3000/auth/logout", { withCredentials: true })
	logOut({})
}