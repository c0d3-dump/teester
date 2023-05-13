import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";
import { ProjectModel } from "../models/project";
import { setProjects } from "src/service";

interface initialStateInterface {
  value: ProjectModel[];
}

const initialState: initialStateInterface = {
  value: [],
};

interface UpdatePayloadInterface {
  data: ProjectModel;
  idx: number;
}

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject(state, { payload }: { payload: ProjectModel[] }) {
      state.value = payload;
    },
    addProject(state, { payload }: { payload: ProjectModel }) {
      state.value = [...state.value, payload];

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
    removeProject(state, { payload }: { payload: number }) {
      state.value = state.value.filter((_f, idx) => idx !== payload);

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
    updateProject(state, { payload }: { payload: UpdatePayloadInterface }) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.idx) {
          return payload.data;
        } else {
          return proj;
        }
      });

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
  },
});

export const { setProject, addProject, removeProject, updateProject } = projectSlice.actions;

export const selectProject = (state: RootState) => state.project.value;

export default projectSlice.reducer;
