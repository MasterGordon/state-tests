import { useEffect } from "react";
import MyState from "./example/MyState";
import { attachReduxDevTools, Observer, useObserved } from "./manager/Observer";

const myState = Observer.create(new MyState());
attachReduxDevTools(myState);

let count = 0;
const AppProxy: React.FC = () => {
  console.log(`AppProxy render ${++count}`);
  const { filteredPokemon, filter } = useObserved(myState);

  useEffect(() => {
    console.log("AppProxy effect");
    myState.fetchPokemon();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => myState.setFilter(e.target.value)}
        />
        <button onClick={myState.search}>Search</button>
      </div>
      {filteredPokemon.map((pokemon) => (
        <div key={pokemon.name}>
          <p>{pokemon.name}</p>
        </div>
      ))}
    </div>
  );
};

export default AppProxy;
