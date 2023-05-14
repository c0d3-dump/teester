import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";
import {
  ApiModel,
  CollectionModel,
  DbModel,
  ProjectModel,
} from "../models/project";
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

interface AddCollectionPayloadInterface {
  data: CollectionModel;
  projectId: number;
}

interface RemoveCollectionPayloadInterface {
  projectId: number;
  collectionId: number;
}
interface UpdateCollectionPayloadInterface {
  projectId: number;
  collectionId: number;
  data: CollectionModel;
}
interface AddTestPayloadInterface {
  projectId: number;
  collectionId: number;
  data: ApiModel | DbModel;
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
    addCollection(
      state,
      { payload }: { payload: AddCollectionPayloadInterface }
    ) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };
          tempProj.collections.push(payload.data);
          return tempProj;
        } else {
          return proj;
        }
      });

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
    removeCollection(
      state,
      { payload }: { payload: RemoveCollectionPayloadInterface }
    ) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };
          tempProj.collections = tempProj.collections.filter(
            (_col, idx) => idx !== payload.collectionId
          );
          return tempProj;
        } else {
          return proj;
        }
      });

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
    updateCollection(
      state,
      { payload }: { payload: UpdateCollectionPayloadInterface }
    ) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };

          tempProj.collections = tempProj.collections.map((col, jdx) => {
            if (jdx === payload.collectionId) {
              return payload.data;
            } else {
              return col;
            }
          });

          return tempProj;
        } else {
          return proj;
        }
      });

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
    addTest(state, { payload }: { payload: AddTestPayloadInterface }) {
      console.log(payload);

      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };

          tempProj.collections = tempProj.collections.map((col, jdx) => {
            if (jdx === payload.collectionId) {
              const tempCol = { ...col };
              tempCol.tests = [...tempCol.tests, payload.data];
              return tempCol;
            } else {
              return col;
            }
          });

          return tempProj;
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

export const {
  setProject,
  addProject,
  removeProject,
  updateProject,
  addCollection,
  removeCollection,
  updateCollection,
  addTest,
} = projectSlice.actions;

export const selectProject = (state: RootState) => state.project.value;

export default projectSlice.reducer;
