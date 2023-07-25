import "react-toastify/dist/ReactToastify.css";
import { getProjects } from "./utils";
import { ProjectModel } from "./redux/models/project";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { setProject } from "./redux/reducers/project";
import { ToastContainer } from "react-toastify";
import { useAppDispatch, useAppSelector } from "./redux/base/hooks";
import Collection from "./components/local/Collection";
import Project from "./components/local/Project";
import React, { useEffect, useState } from "react";
import { selectApp, setCollectionName } from "./redux/reducers/app";

function App() {
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(true);

  const header = useAppSelector(selectApp);

  const router = createBrowserRouter([
    {
      path: "/",
      Component: Project,
    },
    {
      path: "/:projectId",
      Component: Collection,
    },
  ]);

  useEffect(() => {
    router.subscribe(() => {
      if (router.state.location.pathname === "/") {
        dispatch(setCollectionName("All Projects"));
      }
    });

    getProjects()
      .then((res) => {
        const data: ProjectModel[] = res.data ?? [];
        dispatch(setProject(data));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch, router]);

  return (
    <>
      <div
        className="
          flex 
          flex-row 
          items-center 
          gap-3 
          md:gap-0
          my-[20px]
          mx-[30px]
          text-2xl"
      >
        <div
          className="text-3xl cursor-pointer sm:block hidden"
          onClick={() => router.navigate("/")}
        >
          <img
            src="/teester-logo.svg"
            alt="Teester Logo"
            height={100}
            width={120}
          />
        </div>
        <div className="md:mr-[50%] sm:m-auto">{header}</div>
      </div>
      <hr />
      <div className="container">
        {isLoading ? (
          <div></div>
        ) : (
          <RouterProvider router={router}></RouterProvider>
        )}
      </div>
      <ToastContainer
        autoClose={1000}
        position="bottom-center"
        hideProgressBar={true}
        theme="dark"
      ></ToastContainer>
    </>
  );
}

export default App;
