import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import projectReducer from "../reducers/project";
import selectedReducer from "../reducers/selected";

export const store = configureStore({
  reducer: {
    project: projectReducer,
    selected: selectedReducer,
  },
  devTools: true,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
