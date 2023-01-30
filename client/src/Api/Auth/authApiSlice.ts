import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
	endpoints: builder => ({
		login: builder.mutation({
			query: (credentials) => ({
				url: '/auth/login',
				method: 'POST',
				body: { ...credentials }
			})
		}),
		refresh: builder.mutation({
			query: () => ({
				url: '/auth/refresh',
				method: 'GET'
			})
		}),
		generatetfa: builder.mutation({
			query: () => ({
				url: '/auth/2fa/generate',
				method: 'GET'
			})
		}),
		logout: builder.mutation({
			query: () => ({
				url: '/auth/logout',
				method: 'POST'
			})
		}),
	})
})

export const {
	useLoginMutation,
	useRefreshMutation,
	useGeneratetfaMutation,
	useLogoutMutation,
} = authApiSlice

