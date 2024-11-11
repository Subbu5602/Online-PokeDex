let currentPokemonID = null;

//execute arrow func after page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const MAX_POKEMONS = 200;
  //window.loaction.search returns a query string [Eg : ....?key=value]
  //URLSearchParams handles query strings
  //get("id") -> returns value of key "id"
  const pokemonID = new URLSearchParams(window.location.search).get("id");
  //converts string id to integer format
  const id = parseInt(pokemonID, 10);

  //edge case for invalid id, no detail page, return to home page
  if (id < 1 || id > MAX_POKEMONS) {
    return (window.location.href = "./index.html");
  }

  currentPokemonID = id;
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);

    //selecting html elements for physical features like height and moves
    //multiple query selctors for fine selecting a very specific query inside a hierarchy if parent queries
    const abilitiesWrapper = document.querySelector(
      ".pokemon-detail-wrap .pokemon-detail.move"
    );
    abilitiesWrapper.innerHTML = "";

    if (currentPokemonID === id) {
      //pokemon constant has pokemon specific battle and physical details as json, passed into the function
      displayPokemonDetails(pokemon);
      const flavorText = getEnglishFlavorText(pokemonSpecies);
      document.querySelector(".body3-fonts.pokemon-description").textContent =
        flavorText;

      const leftArrow = document.querySelector("#leftArrow");
      const rightArrow = document.querySelector("#rightArrow");

      //same as addEventListener, but also does memory cleanup of the last calling of the function since user might spam the buttons
      leftArrow.removeEventListener("click", navigatePokemon);
      rightArrow.removeEventListener("click", navigatePokemon);

      //decrease id by 1 when clicking left
      if (id != 1) {
        leftArrow.addEventListener("click", () => {
          navigatePokemon(id - 1);
        });
      }

      //same for clicking right
      if (id != 200) {
        rightArrow.addEventListener("click", () => {
          navigatePokemon(id + 1);
        });
      }

      //after clicking any arrow, the prev page will be added to history so users can navigate by browser back button or opening history
      // window.history.pushState(state, title, url);
      // state: Object containing the state of the page (empty object here).
      // title: The title for the new history entry (ignored by most browsers).
      // url: The new URL to show in the browser’s address bar (e.g., "./detail.html?id=1").
      window.history.pushState({}, "", `./detail.html?id=${id}`);
    }
    return true;
  } catch (error) {
    console.error("An error occured while fetching Pokemon data:", error);
    return false;
  }
}

async function navigatePokemon(id) {
  currentPokemonID = id;
  await loadPokemon(id); //get details, then load
}

//color codes for each type
const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
};

//func to set css style of any element
function setElementStyles(elements, cssProperty, value) {
  elements.forEach((element) => {
    element.style[cssProperty] = value;
  });
}

//hex value to rgba value [Eg: #ac5478 -> 145,54,87]
function rgbaFromHex(hexColor) {
  return [
    parseInt(hexColor.slice(1, 3), 16), //2 letters of hex to corresponding int
    parseInt(hexColor.slice(3, 5), 16), //next 2 hex numbers into corresponding int
    // hex numbers != int numbers since diff number formats
    parseInt(hexColor.slice(5, 7), 16),
  ] // same as above
    .join(", "); // join 3 numbers we got from the hex values into comma separated values
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name; //1st element of types array - so primary type of pokemon [Eg : Grass for bulbasaur ignoring poison]
  const color = typeColors[mainType]; //typeColors have color codes for every type

  if (!color) {
    console.warn(`Color not defined for type: ${mainType}`);
    return;
  }

  const detailMainElement = document.querySelector(".detail-main");
  //function to take an element, a css property, and the value of that property
  //changing bg color of main detail into color of main type of the pokemon
  setElementStyles([detailMainElement], "backgroundColor", color);
  //border color changing
  setElementStyles([detailMainElement], "borderColor", color);
  //selects all p directly within "power-wrapper"
  setElementStyles(
    document.querySelectorAll(".power-wrapper > p"),
    "backgroundColor",
    color
  );
  //text color of stats
  setElementStyles(
    document.querySelectorAll(".stats-wrap p.stats"),
    "color",
    color
  );
  //color of progress bar
  setElementStyles(
    document.querySelectorAll(".stats-wrap .progress-bar"),
    "color",
    color
  );

  //get rgba color format from hex color format
  const rgbaColor = rgbaFromHex(color);
  const styleTag = document.createElement("style");
  //webkit is used to create a progress bar pic
  // Initially, the entire progress bar has 50% opacity (0.5), making it semi-transparent.
  // As the progress bar fills up, the filled portion (the progress value) will have full opacity (1),
  // making it fully visible, while the empty portion remains semi-transparent.

  styleTag.innerHTML = `.stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: ${color};
    }
    `;
  document.head.appendChild(styleTag); //style is applied into head of DOM so browser loads the style first before loading the web page
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

//function to add specific heml elements under anoother html element as the parent
function createAndAppendElement(parent, tag, options = {}) {
  const element = document.createElement(tag);
  //Object.keys retrieves the keys after which we iterate over them
  Object.keys(options).forEach((key) => {
    //put the specific attribute into the newly created html element
    element[key] = options[key]; //so element[className] = options[className] -> element[className] = "body-3-fonts detail-wrapper etc"
  });
  //append the new element ito the overarching parent html element
  parent.appendChild(element);
  return element; //just in case the new created element needs to be chained with more functions, else func can work standalone
}

function displayPokemonDetails(pokemon) {
  //getting values for these seven different keys in the json stored in the 7 diff variables using destructuring
  const { name, id, types, weight, height, abilities, stats } = pokemon;
  const capitalizePokemonName = capitalizeFirstLetter(name); //simple func

  document.querySelector("title").textContent = capitalizePokemonName;

  //"detail-main is class in main element which is in body element, basically entire body of detail page"
  const detailMainElement = document.querySelector(".detail-main");
  //add pokemon name specific class to the main html element
  detailMainElement.classList.add(name.toLowerCase());
  //name of pokemon in "name-wrap" and "name" div
  document.querySelector(".name-wrap .name").textContent =
    capitalizePokemonName;
  //id of the pokemon, formatted to have at least 3 digits, if less than 3 digits, pad with zero
  document.querySelector(
    ".pokemon-id-wrap .body2-fonts"
  ).textContent = `#${String(id).padStart(3, "0")}`;
  //image of the pokemon in detail page (intially empty before using the api in next lines)
  const imageElement = document.querySelector(".detail-img-wrapper img");
  //get the image from api
  imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  imageElement.alt = name;
  //the small button like elements showing type with corresponding color
  const typeWrapper = document.querySelector(".power-wrapper");
  typeWrapper.innerHTML = "";
  //iterate through each types(or type if singular type, in which case arr will have size 1)
  types.forEach(({ type }) => {
    //function that takes -> element in which child to be inserted, tags to be inserted, features of inserted tags
    //so we insert into typeWrapper, paragraphs, with classnames and some text content
    createAndAppendElement(typeWrapper, "p", {
      className: `body3-fonts type ${type.name}`, //each type.name is also a relevant color code used for styling
      textContent: type.name, //text content = type
    });
  });

  document.querySelector(
    ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight"
  ).textContent = `${weight / 10} kg`; //10 division to have relevant measurement unit values

  document.querySelector(
    ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height"
  ).textContent = `${height / 10} m`;

  const abilitiesWrapper = document.querySelector(
    ".pokemon-detail-wrap .pokemon-detail.move"
  );
  //same logic as type
  abilities.forEach(({ ability }) => {
    createAndAppendElement(abilitiesWrapper, "p", {
      className: "body3-fonts",
      textContent: ability.name,
    });
  });

  const statsWrapper = document.querySelector(".stats-wrapper");
  statsWrapper.innerHTML = "";

  const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: "SPD",
  };

  //now iterating over the stats of pokemon,the last one left from the key values we got from destructuring, in start of the function
  stats.forEach(({ stat, base_stat }) => {
    const statDiv = document.createElement("div");
    statDiv.className = "stats-wrap";
    //insert into statWrapper each div containing a stat
    statsWrapper.appendChild(statDiv);

    //insert into each statDiv a specific paragraph
    //stat Name like [ATK,DEF etc]
    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts stats",
      //give relevant stat name so we get "attack" as response from api but we show "ATK" to user
      textContent: statNameMapping[stat.name],
    });

    //Numeric stat value padded with length 3 and zeroes
    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts",
      textContent: String(base_stat).padStart(3, "0"),
    });

    //make progress bar with the numeric value of the stat
    createAndAppendElement(statDiv, "progress", {
      className: "progress-bar",
      value: base_stat,
      max: 100,
    });
  });

  setTypeBackgroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
  for (let entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "en") {
      //replace possible redundant form feed with spaces
      //entryflavour.text given by api, we adjust and assign it to flavour
      let flavor = entry.flavor_text.replace(/\f/g, " ");
      return flavor;
    }
  }
  return ""; //for edge case when no flavour text
}
