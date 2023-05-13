import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";
import { ProjectModel } from "../models/project";

interface initialStateInterface {
  value: ProjectModel[];
}

const initialState: initialStateInterface = {
  value: [],
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    addProject(state, { payload }: { payload: ProjectModel[] }) {
      // state.value = payload;
      console.log(payload);
    },
  },
});

export const { addProject } = projectSlice.actions;

export const selectAllProjects = (state: RootState) => state.project.value;
export const selectProject = (state: RootState, idx: number) =>
  state.project.value[idx];

export default projectSlice.reducer;
