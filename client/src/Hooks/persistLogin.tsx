import { useState, useEffect } from "react";
import { selectCurrentToken } from './authSlice'
import { useSelector, useDispatch } from "react-redux"
import axios, {AxiosResponse} from "axios";
import { setCredentials, logOut } from './authSlice'
import { Outlet } from "react-router-dom"
			

const PersistLogin = () => {
	const [isLoading, setIsLoading] = useState(true)
	const dispatch = useDispatch()
	const auth = useSelector(selectCurrentToken) ? true : false

	useEffect(() => {
		const verifyRefreshToken = async () => {
			try {
				await axios.get("http://localhost:3000/auth/refresh", { withCredentials: true })
				.then((response: AxiosResponse) => {
					dispatch(setCredentials({ user: response.data.user, accessToken: response.data.jwt_token }))
				})
			}
			catch (e) {
				logOut({})	
			}
			finally {
				setIsLoading(false);
			}
		}
		!auth ? verifyRefreshToken() : setIsLoading(false);
	}, [auth, dispatch])

	return (
		<>
			{isLoading
				? <h1> Loading ...</h1>
				: <Outlet />
			}
		</>
	)
}

export default PersistLogin