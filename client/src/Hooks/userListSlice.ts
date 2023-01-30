import  { createSlice } from "@reduxjs/toolkit";

const userListSlice = createSlice({
	name: 'userList',
	initialState: { userList: [] },
	reducers: {
		setUserlist: (state, action) => {
			state.userList = action.payload;
		},
	},
});

export const{ setUserlist } = userListSlice.actions;

export default userListSlice.reducer;

export const selectUserlist	= (state: any) => state.userList;
