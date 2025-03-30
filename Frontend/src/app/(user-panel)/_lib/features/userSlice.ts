import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface IUserSlice {
    user: any
    permissions: Record<string, Record<string, number>> | null
}

let initialState: IUserSlice = {
    user: '',
    permissions: null
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