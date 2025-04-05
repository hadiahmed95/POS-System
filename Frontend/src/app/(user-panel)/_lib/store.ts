import { configureStore } from "@reduxjs/toolkit";
import { IUserSlice, userReducer } from "./features/userSlice";
import { useDispatch, useSelector } from "react-redux";

export interface PreloadedState {
    user: IUserSlice;
}

export const createStore = (preloadedState: PreloadedState) => configureStore({
  reducer: {
    user: userReducer
  },
  preloadedState: {
    ...preloadedState
  }
});

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppDispatch = useDispatch.withTypes()