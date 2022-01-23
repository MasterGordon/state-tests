import { useEffect, useMemo, useState } from "react";

type Action = string | number | symbol;
type ActionListener = (action: Action, data: any) => void;

type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

type KeysNotOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? never : K;
}[keyof O];

function isPromise(obj: any) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

export class Observer<T extends object> {
  private subject: T;
  private listeners: ActionListener[] = [];
  private proxy: InstanceType<typeof Proxy>;

  constructor(subject: T) {
    this.subject = subject;
    const invoke = this.observer_invoke.bind(this);
    this.proxy = new Proxy(subject, {
      apply(_target, _thisArg, args) {
        console.log("apply");
        return invoke(args[0], ...args.slice(1));
      },
      set() {
        throw new Error(
          "Don't set properties on the state invoke methods instead"
        );
      },
      get(target: T, key) {
        if (typeof Reflect.get(target, key) === "function") {
          throw new Error(
            "Don't invoke methods on the state invoke methods instead"
          );
        }
        return Reflect.get(target, key);
      },
    });
    [
      ...Object.keys(subject),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(subject)),
    ].forEach((key) => {
      console.log(Reflect.get(subject, key));
      if (typeof Reflect.get(subject, key) === "function") {
        console.log(key);
        Reflect.set(this, key, (...args: any[]) =>
          invoke(key as KeysOfType<T, Function>, ...args)
        );
      }
    });
  }

  public observer_addListener(listener: ActionListener) {
    this.listeners.push(listener);
  }

  public observer_removeListener(listener: ActionListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public async observer_invoke<A extends KeysOfType<T, Function>>(
    action: A,
    ...args: any
  ) {
    const result = (this.subject[action] as any as Function).apply(
      this.subject,
      args
    );
    if (isPromise(result)) await result;
    this.listeners.forEach((listener) => listener(action, result));
  }

  public observer_getSubject() {
    return this.proxy;
  }

  public observer_getName() {
    return this.subject.constructor.name;
  }

  public observer_getState() {
    return this.subject;
  }

  public static create = <T extends object>(subject: T) => {
    const observer = new Observer(subject);
    return observer as ObjectWithOnlyFunctions<T> & Observer<T>;
  };
}

type ObjectWithOnlyFunctions<T> = {
  [P in KeysOfType<T, Function>]: T[P];
};

type ObjectWithoutFunctions<T> = {
  [P in KeysNotOfType<T, Function>]: T[P];
};

export const attachReduxDevTools = <T extends object>(
  observed: Observer<T>,
  name?: string
) => {
  const reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
    name: name || observed.observer_getName(),
  });
  if (reduxDevTools) {
    reduxDevTools.init(observed.observer_getState());
    observed.observer_addListener((action) => {
      reduxDevTools.send(action as any, observed.observer_getState());
    });
  }
};

export const useObserved = <T extends object>(observed: Observer<T>) => {
  const [, setState] = useState(0);
  useEffect(() => {
    console.log("useObserved");
    const listener = () => {
      setState((state) => state + 1);
    };
    observed.observer_addListener(listener);
    return () => observed.observer_removeListener(listener);
  }, [observed]);
  return useMemo(
    () => observed.observer_getSubject() as Readonly<ObjectWithoutFunctions<T>>,
    [observed]
  );
};
