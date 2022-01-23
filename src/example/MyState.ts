interface Pokemon {
  name: string;
  url: string;
}

class MyState {
  public pokemon: Pokemon[] = [];
  public filteredPokemon: Pokemon[] = [];
  public filter: string = "";

  public async fetchPokemon() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
    const json = await response.json();
    this.pokemon = json.results;
  }

  public search() {
    this.filteredPokemon = this.pokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  public setFilter(filter: string) {
    this.filter = filter;
  }
}

export default MyState;
