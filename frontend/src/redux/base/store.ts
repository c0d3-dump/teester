import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import projectReducer from "../reducers/project";
import selectedTester from "../reducers/tester";
import SelectedApp from "../reducers/app";

export const store = configureStore({
  reducer: {
    project: projectReducer,
    tester: selectedTester,
    app: SelectedApp,
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
