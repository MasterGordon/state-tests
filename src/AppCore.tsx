import type {} from "@redux-devtools/extension";
import { useEffect, useState } from "react";

interface Request {
  type: string;
  [key: string]: any;
}

interface Interactor {
  process: (request: Request) => void;
}

// TODO: besseres Interface für Store
type Store = {
  [key: string]: any;
};

class Increment implements Interactor {
  constructor(private store: Store) {
    this.store.counter = 0;
  }

  process(_request: Request) {
    this.store.counter++;
  }
}
type Redux = ReturnType<
  Exclude<typeof window["__REDUX_DEVTOOLS_EXTENSION__"], undefined>["connect"]
>;

class Core {
  store: Store = {};
  redux: Redux | undefined;
  listener: Function[] = [];

  constructor(private interactors: Interactor[]) {
    this.redux = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      name: "Core",
    });
    this.redux?.init(this.store);
  }

  addInteractor(interactor: Interactor) {
    this.interactors.push(interactor);
  }

  addListener(listener: Function) {
    this.listener.push(listener);
  }

  removeListener(listener: Function) {
    this.listener = this.listener.filter((l) => l !== listener);
  }

  processRequest(request: Request) {
    this.interactors
      .find((interactor) => interactor.constructor.name === request.type)
      ?.process(request);
    // TODO: Durch Proxy um den store nur Listener triggern, welche auf store bereiche hören
    this.listener.forEach((listener) => listener());
    this.redux?.send(request.type as any, this.store);
  }
}

// TODO: bei use Store den Bereich des Stores mit Übergeben
const useStore = (core: Core) => {
  const [, setState] = useState(0);
  useEffect(() => {
    const listener = () => setState((state) => ++state);
    core.addListener(listener);
    return () => core.removeListener(listener);
  }, [core]);
  return core.store;
};

const core = new Core([]);
core.addInteractor(new Increment(core.store));

const AppCore: React.FC = () => {
  const store = useStore(core);

  return (
    <div>
      <h1>Hello World</h1>
      <div>Counter: {store.counter}</div>
      <button onClick={() => core.processRequest({ type: "Increment" })}>
        Increment
      </button>
    </div>
  );
};

export default AppCore;
