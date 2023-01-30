import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut } from '../Hooks/authSlice'

const baseQuery = fetchBaseQuery({
	baseUrl: 'http://localhost:3000',
	credentials: 'include',
	prepareHeaders: (headers, { getState }: any) => {
		const token = getState().auth.token
		if (token) {
			headers.set("authorization", `Bearer ${token}`)
		}
		return headers
	}
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
	let result = await baseQuery(args, api, extraOptions)

	if (result?.error?.status === 401) {
		const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
		if (refreshResult?.data) {
			const user = api.getState().auth.user
			api.dispatch(setCredentials({ ...refreshResult.data, user }))
			result = await baseQuery(args, api, extraOptions)
		} else {
			api.dispatch(logOut(api.getState()))// verifier
		}
	}
	return result
}

export const apiSlice = createApi({
	baseQuery: baseQueryWithReauth,
	endpoints: builder => ({})
})