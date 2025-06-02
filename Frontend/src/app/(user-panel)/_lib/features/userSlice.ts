import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IPermissions } from "../../type"

export interface IUserSlice {
    user: any
    permissions: any[]
}

let initialState: IUserSlice = {
    user: '',
    permissions: []
}

const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<any>) => {
            state.user = action.payload
        }
    }
})

export const { setUserData } = userSlice.actions

export const userReducer = userSlice.reducer