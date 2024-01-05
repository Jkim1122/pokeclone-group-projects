import { useState, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate, useOutletContext } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";

import { wildApi, pokeApi, teamApi } from "../components/utilities";
import rejection_sound from "/src/assets/BattleMusic/489366__morjon17__rejected_feedback.wav";

// "gym/"
const GymPage = () => {
  const [randomNum, setRandomNum] = useState();
  const [currentOpponent, setCurrentOpponent] = useState();
  const [currentPokemon, setCurrentPokemon] = useState();
  const [currentPokemonHealth, setCurrentPokemonHealth] = useState();
  const [currentPokemonHealthTotal, setCurrentPokemonHealthTotal] = useState();
  const [currentPokemonExperience, setCurrentPokemonExperience] = useState();
  const [currentPokemonLevel, setCurrentPokemonLevel] = useState();
  const [currentOpponentHealth, setCurrentOpponentHealth] = useState();
  const [currentOpponentHealthTotal, setCurrentOpponentHealthTotal] =
    useState();

  const [currentOpponentList, setCurrentOpponentList] = useState([]);
  const [currentOpponentIndex, setCurrentOpponentIndex] = useState(0);
  const [pokeDeath, setPokeDeath] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [allPokemonDefeated, setAllPokemonDefeated] = useState(false);

  const [trigger, setTrigger] = useState(false);

  const { pokeTeam, setPokeTeam, user, isLoggedIn } = useOutletContext();
  const navigate = useNavigate();

  const rejection = new Howl({
    src: [rejection_sound],
  });

  /////////////////GET WILD TEAM///////////////////////////////////////////////////////////
  const getRandomNum = () => {
    return Math.floor(Math.random() * (100 - 1 + 1)) + 1;
  };

  const wildPoke = async () => {
    const opponentList = [];

    for (let i = 0; i < 6; i++) {
      const randomNum = getRandomNum();
      const response = await wildApi.get(`${randomNum}`);
      const pokemon = response.data;
      opponentList.push({
        id: pokemon.id,
        type: pokemon.type,
        name: pokemon.name,
        move_1: pokemon.move_1,
        move_2: pokemon.move_2,
        front_img: pokemon.front_img,
        back_img: pokemon.back_img,
        pokemon_id: pokemon.pokemon_id,
        base_hp: pokemon.base_hp,
        hp: pokemon.hp,
        xp: pokemon.xp,
        lvl: pokemon.lvl,
      });
    }

    return opponentList;
  };

  /////////////////GET TEAM///////////////////////////////////////////////////////////
  const getTeam = async () => {
    const storedToken = localStorage.getItem("token");

    try {
      teamApi.defaults.headers.common["Authorization"] = `Token ${storedToken}`;

      let response = await teamApi.get("manager/");

      if (response.status === 200) {
        setPokeTeam(response.data[0].pokemons);
        setCurrentPokemon(response.data[0].pokemons[0].user_pokemon.pokemon);
        setCurrentPokemonHealth(
          response.data[0].pokemons[0].user_pokemon.pokemon.hp
        );
        setCurrentPokemonHealthTotal(
          response.data[0].pokemons[0].user_pokemon.pokemon.base_hp
        );
        setCurrentPokemonLevel(
          response.data[0].pokemons[0].user_pokemon.pokemon.lvl
        );
        setCurrentPokemonExperience(
          response.data[0].pokemons[0].user_pokemon.pokemon.xp
        );
        if (currentPokemonExperience >= 100) {
          setCurrentPokemonExperience(currentPokemonExperience - 100);
          setCurrentPokemonLevel(currentPokemonLevel + 1);
        }
      } else {
        alert("Error retrieving team");
      }
    } catch (error) {
      console.error("Error retrieving team:", error);
    }
  };

  /////////////////ATTACK///////////////////////////////////////////////////////////
  const handleHealthUpdate = (newHealth) => {
    setCurrentOpponentHealth(newHealth);
  };

  const handleMove = async (moveNumber) => {
    let attack, exp;

    if (moveNumber === 1) {
      attack = Math.floor(Math.random() * (10 - 0 + 1));
      exp = Math.floor(Math.random() * (10 - 3 + 1)) + 5;
    } else if (moveNumber === 2) {
      attack = Math.floor(Math.random() * (10 - 0 + 1));
      exp = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
    } else {
      console.error("Invalid move number");
      return;
    }

    const newHealth = Math.max(
      0,
      currentOpponentList[currentOpponentIndex].hp - attack
    );

    setCurrentOpponentList((prevList) => [
      ...prevList.slice(0, currentOpponentIndex),
      { ...prevList[currentOpponentIndex], hp: newHealth },
      ...prevList.slice(currentOpponentIndex + 1),
    ]);

    if (currentOpponentHealth <= 0) {
      saveHealthXP();
    } else {
      let counterAttack = Math.floor(Math.random() * (10 - 0 + 1));
      setCurrentPokemonHealth(currentPokemonHealth - counterAttack);
      saveHealthXP();

      if (currentPokemonHealth <= 0) {
        await saveHealthXP();
        setPokeDeath(true);
        openModal();
      } else {
        setPokeDeath(false); // Set to false if the Pokemon is still alive
      }
    }
  };

  /////////////////RUN///////////////////////////////////////////////////////////
  const handleRun = () => {
    let runChance = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (runChance < 4) {
      saveHealthXP(); //add post request to save experience and health
      navigate("/main");
    } else {
      rejection.play();
      console.log("You couldn't escape");
    }
  };

  ////////////////SAVE HEALTH and XP///////////////////////////////////////////////////////////
  const saveHealthXP = async () => {
    // console.log("saving health and xp...");
    const storedToken = localStorage.getItem("token");
    try {
      pokeApi.defaults.headers.common["Authorization"] = `Token ${storedToken}`;

      let data = {
        pokemon_id: currentPokemon.id,
        hp: currentPokemonHealth,
        base_hp: currentPokemon.base_hp,
        xp: currentPokemonExperience,
        lvl: currentPokemonLevel,
        name: currentPokemon.name,
        type: currentPokemon.type,
        move_1: currentPokemon.move_1,
        move_2: currentPokemon.move_2,
        front_img: currentPokemon.front_img,
        back_img: currentPokemon.back_img,
      };

      let response = await pokeApi.put(`${currentPokemon.id}/`, data); //updates pokemon stats

      if (response.status === 200) {
        // console.log("poke info saved"); //change current pokemon to selected pokemon
      } else {
        alert("Error retrieving team");
      }
    } catch (error) {
      console.error("Error retrieving team:", error);
    }
  };

  ////////////CHANGE POKEMON///////////////////////////////////////////////////////////

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handlePokemonFaint = () => {
    setPokeDeath(true);
    openModal();
  };

  const handlePokemonSelection = (selectedPokemon) => {
    // Handle the logic for selecting a new Pokemon and close the modal
    setPokeDeath(false);
    closeModal();
  };

  const handleOptionClick = async (poke) => {
    //save current pokemon health/exp
    await saveHealthXP();
    await getTeam();

    setCurrentPokemon(poke);
    setCurrentPokemonHealth(poke.hp);
    setCurrentPokemonExperience(poke.xp);
    setCurrentPokemonHealthTotal(poke.base_hp);
    setCurrentPokemonLevel(poke.lvl);
    closeModal();
  };

  ////////////HANDLE DEFEATING A CURRENT OPPONENT POKEMON///////////////////////////////////////////////////////////
  const handleDefeat = () => {
    if (currentOpponentIndex < currentOpponentList.length - 1) {
      setCurrentOpponentIndex(currentOpponentIndex + 1);
      setPokeDeath(false); // Reset pokeDeath for the new Pokémon
    } else {
      // All Pokémon in the list are defeated
      console.log("All Pokémon defeated");
    }
  };

  ////////////USE EFFECT///////////////////////////////////////////////////////////
  useEffect(() => {
    const initializeBattle = async () => {
      try {
        // Generate opponent list
        const generatedOpponentList = await wildPoke();
        // console.log("Generated Opponent List:", generatedOpponentList);

        // Update state with the generated opponent list
        setCurrentOpponentList((prevOpponentList) => [
          ...prevOpponentList,
          ...generatedOpponentList,
        ]);

        // console.log("Updated Opponent List:", [
        //   ...currentOpponentList,
        //   ...generatedOpponentList,
        // ]);
      } catch (error) {
        console.error("Error initializing battle:", error);
      }
    };

    // Call the initialization function
    initializeBattle();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user's team after generating opponents
      await getTeam();
    };
    fetchData();
  }, []);

  //   useEffect(() => {
  //     console.log("Team updated", pokeTeam);
  //     console.log("Current Pokemon", currentPokemon);
  //   }, [pokeTeam]);

  useEffect(() => {
    const checkPokemonAlive = async () => {
      // Check if all Pokemon in the team are defeated
      const anyPokemonAlive = await pokeTeam.some(
        (pokemon) => pokemon.user_pokemon.pokemon.hp > 0
      );

      // Set the state based on the defeat condition
      setAllPokemonDefeated(!anyPokemonAlive);
      console.log(allPokemonDefeated);

      //   If all Pokemon are defeated, navigate to the "loser" page
      // if (!anyPokemonAlive) {
      //   console.log("You lose! All Pokémon are defeated.");
      //   navigate("/victory/");
      // }
    };

    // Trigger the asynchronous check after state updates
    checkPokemonAlive();
  }, [pokeTeam, navigate]);

  return (
    // <h1> Gym</h1>
    <div className="full_page_div">
      {currentPokemon ? (
        <div id="battle_div">
          {/* <audio
                autoPlay
                src={battlemusic1}
                loop
                type="audio/wav"
                volume="0.2"
            ></audio> */}

          <div id="battle_options_div">
            <div id="moves_div">
              <button onClick={() => handleMove(1)} className="battle_buttons">
                {currentPokemon.move_1}
              </button>
              <button onClick={() => handleMove(2)} className="battle_buttons">
                {currentPokemon.move_2}
              </button>
            </div>

            <div id="other_options_div">
              <button className="battle_buttons">NO Capture Function</button>
              <button onClick={openModal} className="battle_buttons">
                Change Pokemon
              </button>
              <button onClick={handleRun} className="battle_buttons">
                Run
              </button>
            </div>
          </div>

          <div id="poke_div">
            <div>
              {pokeDeath && (
                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  contentLabel="Your Team"
                >
                  <h2>Select a Pokemon:</h2>
                  {pokeTeam.map((poke) => (
                    <button
                      key={poke.user_pokemon.pokemon.id}
                      onClick={() =>
                        handleOptionClick(poke.user_pokemon.pokemon)
                      }
                      disabled={pokeDeath}
                    >
                      {poke.user_pokemon.pokemon.name}
                      <img
                        src={poke.user_pokemon.pokemon.front_img}
                        alt={poke.user_pokemon.pokemon.name}
                      />
                    </button>
                  ))}
                  <button onClick={closeModal}>Close</button>
                </Modal>
              )}
            </div>

            <div id="your_pokemon_div">
              <div id="your_pokemon_status_div">
                <h3>{currentPokemon.name}</h3>
                <h4>Level: {currentPokemonLevel}</h4>
                <div className="status_bar_div">
                  <ProgressBar
                    max={currentPokemonHealthTotal}
                    now={currentPokemonHealth}
                    label={`${currentPokemonHealth}`}
                    className="actual_status_bar"
                  />
                  <ProgressBar
                    now={currentPokemonExperience}
                    label={`${currentPokemonExperience}`}
                    className="actual_status_bar"
                  />
                </div>
                <img
                  alt="poke"
                  src={`${currentPokemon.back_img}`}
                  className="pokemon_image"
                />
              </div>
            </div>

            <div>
              {currentOpponentList.length > 0 &&
                currentOpponentIndex < currentOpponentList.length && (
                  <div
                    key={currentOpponentList[currentOpponentIndex].id}
                    className={`opponent_status_bar_div ${
                      currentOpponentHealth <= 0 ? "opponent-fainted" : ""
                    }`}
                  >
                    <ProgressBar
                      max={currentOpponentList[currentOpponentIndex].base_hp}
                      now={currentOpponentList[currentOpponentIndex].hp}
                      label={currentOpponentList[currentOpponentIndex].hp}
                      className="opponent_status_bar"
                    />

                    <img
                      src={`${currentOpponentList[currentOpponentIndex].front_img}`}
                      className="pokemon_image"
                    />
                  </div>
                )}
              {pokeDeath && (
                <div>
                  <p>
                    {currentOpponentList[currentOpponentIndex].name} fainted!
                  </p>
                  <button onClick={handleDefeat}>Next Pokémon</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        "loading..."
      )}
    </div>
  );
};

export default GymPage;
