import { useEffect, useState } from "react";
import type {} from "@redux-devtools/extension";

class State {
  public counter: number = 0;
  public decrements: number = 0;

  public decrement() {
    this.counter--;
    this.decrements++;
  }

  public increment() {
    this.counter++;
  }
}

type Class = { new (...args: any[]): any };

export interface Observable {
  addObserver: (onUpdate: Function) => void;
}

const privatePrefix = "_" as const;
const observed = <T extends Class>(subject: T): T & Observable => {
  const proxyedSubject = function (...args: any) {
    const instance = new subject(...args);
    const reduxDev = window.__REDUX_DEVTOOLS_EXTENSION__?.connect?.({
      name: instance.constructor.name,
    });
    reduxDev?.init?.(instance);
    const subscriber = new Set<Function>();
    Object.getOwnPropertyNames(instance).forEach((name) => {
      instance[privatePrefix + name] = instance[name];
      Object.defineProperty(instance, name, {
        get: () => instance[privatePrefix + name],
        set: (value) => {
          instance[privatePrefix + name] = value;
          console.log(`${name} changed to ${value}`);
          subscriber.forEach((sub) => sub());
          const filtered = Object.keys(instance)
            .filter((key) => !key.startsWith(privatePrefix))
            .reduce((obj: any, key) => {
              obj[key] = instance[key];
              return obj;
            }, {});
          // @ts-ignore
          reduxDev?.send?.("updating " + name, filtered);

          // @ts-ignore
          console.log(instance);
        },
      });
    });
    instance["addObserver"] = (sub: () => void) => {
      subscriber.add(sub);
    };

    return instance;
  };
  return proxyedSubject as any;
};

export const useObservable = (observable: Observable) => {
  const [, setCounter] = useState(0);
  useEffect(() => {
    observable.addObserver(() => setCounter((counter) => counter + 1));
  }, [observable]);
  return observable as any;
};

const ObservableState = observed(State);
export default ObservableState;
