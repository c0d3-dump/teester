import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../reducers/counter";
import projectReducer from "../reducers/project";


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    project: projectReducer
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
