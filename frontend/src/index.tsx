import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/base/store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import axios from "axios";
import { toast } from "react-toastify";

const container = document.getElementById("root")!;
const root = createRoot(container);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    toast.error("something went wrong");
    return Promise.reject(error);
  }
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
