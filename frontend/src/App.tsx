import React, { useEffect, useState } from "react";

import Project from "./components/local/Project";
import Collection from "./components/local/Collection";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProjectModel } from "./redux/models/project";
import { setProject } from "./redux/reducers/project";
import { getProjects } from "./utils";
import { useAppDispatch } from "./redux/base/hooks";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(true);

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
    getProjects()
      .then((res) => {
        const data: ProjectModel[] = res.data ?? [];
        dispatch(setProject(data));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch]);

  useEffect(() => {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        toast.error(error.response.data);
        return Promise.reject();
      }
    );
  }, []);

  return (
    <>
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
