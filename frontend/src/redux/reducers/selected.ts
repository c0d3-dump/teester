import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";

interface initialStateInterface {
  value: number;
}

const initialState: initialStateInterface = {
  value: -1,
};

export const selectedSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setSelected(state, { payload }: { payload: number }) {
      state.value = payload;
    },
  },
});

export const { setSelected } = selectedSlice.actions;

export const selectSelected = (state: RootState) => state.selected.value;

export default selectedSlice.reducer;
