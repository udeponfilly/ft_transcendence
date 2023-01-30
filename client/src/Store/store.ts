import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../Api/apiSlice";
import authReducer from "../Hooks/authSlice"
import userListReducer from "../Hooks/userListSlice";

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		auth: authReducer,
		userList: userListReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(apiSlice.middleware),
	devTools: true
})