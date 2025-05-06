import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IBranch } from "../../type"

export interface IBranchSlice {
    branch: IBranch | null
}

let initialState: IBranchSlice = {
    branch: null
}

const branchSlice = createSlice({
    name: 'branch',
    initialState: initialState,
    reducers: {
        setBranch: (state, action: PayloadAction<any>) => {
            state.branch = action.payload
        }
    }
})

export const { setBranch } = branchSlice.actions

export const branchReducer = branchSlice.reducer