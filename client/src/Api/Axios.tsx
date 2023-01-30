import axios, {AxiosResponse} from 'axios'
import { store } from "../Store/store"
import { setCredentials } from '../Hooks/authSlice'

const axiosPrivate = async (...params: any) => {
	let result: void | AxiosResponse<any, any>

	try {
		result = await axios(params[0])
	}
	catch (error: any){
		if (error.response.status === 401) {
			result = await refreshTokenAndExecuteRequestAgain(params[0])
		}
	}
	return result
}

const refreshTokenAndExecuteRequestAgain = async (params: any) => {
	let result: void | AxiosResponse<any, any>

	const refreshResult = await refreshRequest()
	if (refreshResult?.data) {
		await store.dispatch(setCredentials({
			user: refreshResult.data.user,
			accessToken: refreshResult.data.jwt_token
		}))
		params = getParamsWithUpdatedAuthorization(params)
		result = await axios(params)
	}
	return result
}

const refreshRequest = async () => {
	const response = await axios({
		withCredentials: true,
		url: "http://localhost:3000/auth/refresh",
		method: "GET"
	})
	.then((response: any) => response)
	.catch((error: any) => {
		window.location.replace("/login");
	})
	return response
}

const getParamsWithUpdatedAuthorization = (...params: any) => {
	if (params[0]?.headers?.Authorization)
		params[0].headers.Authorization = `Bearer ${store.getState().auth.token}`
	return params[0]
}

export default axiosPrivate
