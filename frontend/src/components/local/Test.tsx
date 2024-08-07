import { ApiModel, DbModel } from "src/redux/models/project";
import AddEditTestComponent from "./AddEditTest";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { refreshCollection, selectProject } from "src/redux/reducers/project";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearTester } from "src/redux/reducers/tester";
import { useParams } from "react-router-dom";
import { setCollectionName } from "src/redux/reducers/app";

export default function TestComponent() {
  const dispatch = useAppDispatch();
  const [testListState, setTestListState] = useState<(ApiModel | DbModel)[]>(
    []
  );
  const [dimState, setDimState] = useState(-1);
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");
  const collectionId = parseInt(params.collectionId ?? "-1");
  const projects = useAppSelector(selectProject);

  useEffect(() => {
    dispatch(
      setCollectionName(
        `${projects[projectId].name} / ${projects[projectId].collections[collectionId].name}`
      )
    );
  }, [collectionId, dispatch, projectId, projects]);

  useEffect(() => {
    const tests = projects[projectId].collections[collectionId].tests;
    setTestListState(tests);
  }, [collectionId, projectId, projects, testListState.length]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const onDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const onDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDimState(dragOverItem.current ?? -1);
  }, []);

  const handleSort = useCallback(() => {
    const list = [...testListState];

    const item = list.splice(dragItem.current ?? 0, 1)[0];
    list.splice(dragOverItem.current ?? 0, 0, item);

    return list;
  }, [testListState]);

  const onDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDimState(-1);
      const list = handleSort();

      setTestListState(list);

      dispatch(clearTester());

      dispatch(
        refreshCollection({
          projectId,
          collectionId,
          data: list,
        })
      );
    },
    [dispatch, handleSort, projectId, collectionId]
  );

  return (
    <>
      <div className="my-8">
        {testListState.map((test, idx) => (
          <AddEditTestComponent
            type="EDIT"
            projectId={projectId}
            collectionId={collectionId}
            test={test}
            testId={idx}
            key={idx}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            dimState={dimState}
            project={projects[projectId]}
          ></AddEditTestComponent>
        ))}
      </div>

      <AddEditTestComponent
        type="ADD"
        projectId={projectId}
        collectionId={collectionId}
        project={projects[projectId]}
      ></AddEditTestComponent>
    </>
  );
}
