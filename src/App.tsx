import { useMemo } from "react";
import State, { useObservable } from "./State";

const App: React.FC = () => {
  const state = useMemo(() => new State(), []);
  const oState = useObservable(state as any);
  console.log("rendered");

  return (
    <>
      <div>Hello World</div>
      <div>Counter: {oState.counter}</div>
      <button onClick={() => oState.increment()}>Increment</button>
      <button onClick={() => oState.decrement()}>Decrement</button>
    </>
  );
};

export default App;
