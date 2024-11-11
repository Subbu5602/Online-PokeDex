const MAX_POKEMON = 200;
const listWrapper = document.querySelector(".list-wrapper"); //list of pokemon
const searchInput = document.querySelector("#search-input"); 
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];

//first fetch all pokemons then run the function to display them
fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json()) //converts object to json and returns promise, promise accepted by .then
  .then((data) => {
    allPokemons = data.results; //details of pokemon present in results key of the json object returned by api call
    displayPokemons(allPokemons);
  });

//this func gets pokemon details before user is redirected to specific pokemon details page
async function fetchPokemonDataBeforeRedirect(id) {
  try {
    //promise.all sends two fetch requests concurrently to save time
    //two fetch requests in an array inside promise.all
    // here we see array destructuring to assign the two fetch requests into a const array
    const [pokemon, pokemonSpecies] = await Promise.all([
        //this fetch gets response about pokemon like name,abilities etc and converts reponse to json
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      //this fetch gets species info like habitat and again converts response to json
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);
    // If both fetch requests succeed, return true to indicate successful data retrieval
    return true;
  } catch (error) {
    console.error("Failed to fetch Pokemon data before Redirect", error);
  }
}


function displayPokemons(pokemons) {
  listWrapper.innerHTML = "";
  pokemons.forEach((pokemon) => {
    //extract pokemon id
    const pokemonID = pokemon.url.split("/")[6];
    //craft listItem
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    //used the link in img src to get the image of pokemon
    listItem.innerHTML = `
            <div class="number-wrap">
            <p class="caption-fonts">#${pokemonID}</p>
            </div>
            <div class="img-wrap">
            <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemon.name}" /> 
            </div> 
            <div class="name-wrap">
            <p class="body3-fonts">#${pokemon.name}</p>
            </div>
        `;

    //separate logic for when user clicks on a specific pokemon    
    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDataBeforeRedirect(pokemonID);
      //we get success if details are fetched from api before user gets redirected, thus details are ready for user to see
      if (success) {
        window.location.href = `./detail.html?id=${pokemonID}`;
      }
    });

    //each listItem i.e each pokemon sprite appended to listWrapper in index.html
    listWrapper.appendChild(listItem);
  });
}

searchInput.addEventListener("keyup", handleSearch); //when any key is pressed and released
const closeButton = document.querySelector(".search-close-icon");
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  if(searchTerm){
    closeButton.style.display = "block"; //cross symbol appear when anything is typed in search box
  }
  let filteredPokemons;

  //filtering on id numbers
  if (numberFilter.checked) {
    //extract pokemon id and return all pokemons in filteredPokemons that have the id that user searched for
    filteredPokemons = allPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    // filteredPokemons will have pokemons that are equal to the name user searched for
    filteredPokemons = allPokemons.filter((pokemon) => {
      return pokemon.name.toLowerCase().startsWith(searchTerm);
    });
  } else {
    // user didn't search for anyhting, filteredPokemon is simply allPokemons by default
    filteredPokemons = allPokemons;
  }

  //call displayPokemons function on the filtered pokemons based on user response in search box
  displayPokemons(filteredPokemons);

  //if user gave some inaccurate search term
  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}

closeButton.addEventListener("click", clearSearch);

function clearSearch() {
  //clear search box  
  searchInput.value = "";
  // show all pokemons i.e. return to default home page view
  displayPokemons(allPokemons);
  //remove not found message
  notFoundMessage.style.display = "none";
  //remove close button
  closeButton.style.display = "none";
}
