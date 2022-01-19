const store = {
  counter: 0,
  increment: () => {
    store.counter++;
  },
};

// const proxy = new Proxy(store, {
//   get: (target, prop) => {
//     if (prop in target) {
//       return target[prop];
//     }
//     return target[prop] = 0;
//   },
// });

const AppProxy: React.FC = () => {
  return (
    <div>
      <h2>Counter: </h2>
      <button>Increment</button>
    </div>
  );
};

export default AppProxy;
