import React from "react";
// import { useAppDispatch, useAppSelector } from "./redux/base/hooks";
// import { decrement, increment, selectCount } from "./redux/reducers/counter";
import Collection from "./components/local/Collection";

function App() {
  // const count = useAppSelector(selectCount);
  // const dispatch = useAppDispatch();

  return (
    <div className="container">
      <Collection></Collection>
    </div>
  );
}

export default App;

// <div className="text-red-500">Hello</div>
// <div>{count}</div>
// <button onClick={(e) => dispatch(increment())}>Add</button>
// <button onClick={(e) => dispatch(decrement())}>Remove</button>
