import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../base/store";
import {
  ApiModel,
  CollectionModel,
  DbModel,
  FakerContainerModel,
  FakerModel,
  ProjectModel,
} from "../models/project";
import { setProjects } from "src/utils";

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
interface AddFakerPayloadInterface {
  data: FakerContainerModel;
  projectId: number;
}
interface RemoveFakerPayloadInterface {
  projectId: number;
  fakerId: number;
}
interface UpdateFakerPayloadInterface {
  projectId: number;
  fakerId: number;
  data: FakerModel[];
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
interface UpdateTestPayloadInterface {
  projectId: number;
  collectionId: number;
  testId: number;
  data: ApiModel | DbModel;
}
interface RemoveTestPayloadInterface {
  projectId: number;
  collectionId: number;
  testId: number;
}
interface RefreshCollectionPayloadInterface {
  projectId: number;
  collectionId: number;
  data: (ApiModel | DbModel)[];
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
    updateTest(state, { payload }: { payload: UpdateTestPayloadInterface }) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };

          tempProj.collections = tempProj.collections.map((col, jdx) => {
            if (jdx === payload.collectionId) {
              const tempCol = { ...col };

              tempCol.tests = tempCol.tests.map((test, kdx) => {
                if (kdx === payload.testId) {
                  return payload.data;
                } else {
                  return test;
                }
              });

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
    removeTest(state, { payload }: { payload: RemoveTestPayloadInterface }) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };

          tempProj.collections = tempProj.collections.map((col, jdx) => {
            if (jdx === payload.collectionId) {
              const tempCol = { ...col };

              tempCol.tests = tempCol.tests.filter(
                (_test, kdx) => kdx !== payload.testId
              );

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
    refreshCollection(
      state,
      { payload }: { payload: RefreshCollectionPayloadInterface }
    ) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };

          tempProj.collections = tempProj.collections.map((col, jdx) => {
            if (jdx === payload.collectionId) {
              return { name: col.name, tests: payload.data };
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
    addFaker(state, { payload }: { payload: AddFakerPayloadInterface }) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };
          tempProj.fakers.push(payload.data);
          return tempProj;
        } else {
          return proj;
        }
      });

      setProjects(state.value).catch((err) => {
        console.log(err);
      });
    },
    removeFaker(state, { payload }: { payload: RemoveFakerPayloadInterface }) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };
          tempProj.fakers = tempProj.fakers.filter(
            (_col, idx) => idx !== payload.fakerId
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
    updateFaker(state, { payload }: { payload: UpdateFakerPayloadInterface }) {
      state.value = state.value.map((proj, idx) => {
        if (idx === payload.projectId) {
          const tempProj = { ...proj };

          tempProj.fakers = tempProj.fakers.map((col, jdx) => {
            if (jdx === payload.fakerId) {
              return { name: col.name, data: payload.data };
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
  updateTest,
  removeTest,
  refreshCollection,
  addFaker,
  removeFaker,
  updateFaker,
} = projectSlice.actions;

export const selectProject = (state: RootState) => state.project.value;

export default projectSlice.reducer;
