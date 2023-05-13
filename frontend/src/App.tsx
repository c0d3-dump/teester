import React from "react";
import { useAppSelector } from "./redux/base/hooks";

import Project from "./components/local/Project";
import { selectSelected } from "./redux/reducers/selected";
import Collection from "./components/local/Collection";

function App() {
  const selectedProject = useAppSelector(selectSelected);

  return (
    <div className="container">
      {selectedProject < 0 ? <Project></Project> : <Collection></Collection>}
    </div>
  );
}

export default App;
