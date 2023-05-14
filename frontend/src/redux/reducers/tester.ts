import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";
import { TesterModel } from "../models/tester";

interface initialStateInterface {
  value: TesterModel[];
}

const initialState: initialStateInterface = {
  value: [],
};

export const testerSlice = createSlice({
  name: "tester",
  initialState,
  reducers: {
    clearTester(state) {
      state.value = [];
    },
    addTester(state, { payload }: { payload: TesterModel }) {
      state.value = [...state.value, payload];
    },
  },
});

export const { clearTester, addTester } = testerSlice.actions;

export const selectTester = (state: RootState) => state.tester.value;

export default testerSlice.reducer;
