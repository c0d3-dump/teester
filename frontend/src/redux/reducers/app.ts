import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";

interface initialStateInterface {
  value: string;
}

const initialState: initialStateInterface = {
  value: "All Projects",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCollectionName(state, { payload }: { payload: string }) {
      state.value = payload;
    },
  },
});

export const { setCollectionName } = appSlice.actions;

export const selectApp = (state: RootState) => state.app.value;

export default appSlice.reducer;
