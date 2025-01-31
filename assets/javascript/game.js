/*
  Game Idea instead of jedi and sith,  armies

  space or ground battles are randomly chosen.

  instead of direct numbers players gain more power in the realm of number of attacks

  logic flow:

  3 main parts:
  - gameModel: handles all the logic and input
  - gameObserver: acts as the intermediary between logic and view and tells the others to update
  - gameView: handles dom manipulation

  - functionSubscriber: used to handle music events
  - createArmy: factory function used to create player and enemy armies
*/

// Define the armies and their stats
// Balancing the armies will be the hardest part
const armies = [
  {
    name: "Alliance Army",
    power: 12,
    retaliation: 10,
    attacks: 2,
    maxHp: 60,
    evasion: 3,
    alignment: "Republic",
    picture: {
      ground: "Alliance Army-ground.png",
      space: "Alliance Army-space.jpg"
    }
  },
  {
    name: "Droid Army",
    power: 6,
    retaliation: 8,
    attacks: 3,
    maxHp: 45,
    evasion: 5,
    alignment: "Sith",
    picture: {
      ground: "droid army-ground.jpg",
      space: "droid army-space.jpg"
    }
  },
  {
    name: "Gungan Grand Army",
    power: 8,
    retaliation: 8,
    attacks: 2,
    maxHp: 80,
    evasion: 4,
    alignment: "Republic",
    picture: {
      ground: "Gungan-ground.jpg",
      space: "Gungan.png"
    }
  },
  {
    name: "Imperial Army",
    power: 16,
    retaliation: 8,
    attacks: 1,
    maxHp: 70,
    evasion: 1,
    alignment: "Sith",
    picture: {
      ground: "imperial army-ground.jpg",
      space: "imperial space.jpg"
    }
  },
  {
    name: "Republic Army",
    power: 12,
    retaliation: 8,
    attacks: 2,
    maxHp: 60,
    evasion: 2,
    alignment: "Sith",
    picture: {
      ground: "republic-ground.png",
      space: "republic-space.png"
    }
  },
  {
    name: "Rebel Army",
    power: 6,
    retaliation: 10,
    attacks: 3,
    maxHp: 50,
    evasion: 6,
    alignment: "Republic",
    picture: {
      ground: "rebel-ground.jpg",
      space: "rebel-space.jpg"
    }
  }
];

// Army factory function takes an army object and uses it to create a
function createArmy(army) {
  this.hp = army.maxHp;
  this.power = army.power;
  this.name = army.name;
  this.attacks = army.attacks;
  this.evasion = army.evasion;
  this.retaliation = army.retaliation;
  this.picture = army.picture;
  this.alignment = army.alignment;
  this.attack = function(evasion = 0) {
    //handles attack damage
    let damage = 0;
    // army attacks = to number of attacks but power is random
    for (let i = 0; i < this.attacks; i++) {
      damage += Math.floor(Math.random() * this.power);
    }
    // substract other armies evasion to calculate total damage
    damage = damage - evasion;
    // if damage is negative set it to zero
    if (damage < 0) damage = 0;
    return damage;
  };
  this.retaliate = function(evasion = 0) {
    let damage = 0;
    for (let i = 0; i < this.attacks; i++) {
      damage += Math.floor(Math.random() * this.retaliation);
    }
    damage = damage - evasion;
    // make sure the enemy does damage
    if (damage < 0) damage = 0;
    return damage;
  };
  this.levelUp = function() {
    // when player levels up increase number of attacks
    this.attacks += 1;
    this.evasion += 1;
  };
  return this;
}

// create a subscriber for music events...
// todo? fix this so i can track when the music ends... then update the dom
function subscriber() {
  let subscribers = {};
  return {
    publish(event, callback) {
      // method that adds updated
      // if the event does not exist add the event
      if (!subscribers[event]) {
        subscribers[event] = callback;
      }
    },
    subscribe(event, data) {
      //check to see if event exists
      if (!subscribers[event]) return;
      // call all callbacks registered to that event
      return subscribers[event](data);
    }
  };
}

const subscriberFunction = subscriber();

function playSound(trackName, volume, repeat = false) {
  // Todo getting a random dom error about music...
  // need to figure out how to play a sound then play another right after...
  let audio = new Audio(`./assets/sounds/${trackName}`);
  audio.volume = volume;
  audio.loop = repeat;
  return audio.play();
}

// list of sound effects
const soundEffects = {
  music: ["Asteroidchase.mp3", "Falcon.mp3"],
  fire: ["tiefighter.mp3", "xwingfire.mp3", "turretfire.mp3"],
  explosion: ["explode1.mp3", "explode2.mp3"],
  intro: ["Battlealarm.mp3", "flyby.mp3", "bikeflyby.mp3"],
  outro: ["Lasttime.mp3", "failmeagain.mp3", "laughing.mp3"]
};

subscriberFunction.publish("start-game-music", () => {
  let chosen =
    soundEffects.music[Math.floor(Math.random() * soundEffects.music.length)];
  return playSound(chosen, 0.1, true);
});
subscriberFunction.publish("fire", () => {
  let chosen =
    soundEffects.fire[Math.floor(Math.random() * soundEffects.fire.length)];
  return playSound(chosen, 0.2);
});
subscriberFunction.publish("explode", () => {
  let chosen =
    soundEffects.explosion[
      Math.floor(Math.random() * soundEffects.explosion.length)
    ];
  return playSound(chosen, 0.2);
});
subscriberFunction.publish("intro", () => {
  let chosen =
    soundEffects.intro[Math.floor(Math.random() * soundEffects.intro.length)];
  return playSound(chosen, 0.1);
});

subscriberFunction.publish("outro", () => {
  let chosen =
    soundEffects.outro[Math.floor(Math.random() * soundEffects.outro.length)];
  return playSound(chosen, 0.3);
});


// create an observer that will update our object when things change
function observer() {
  let observers = [];
  return {
    subscribe(callback) {
      observers.push(callback);
    },
    unsubscribe(f) {
      observers = observers.filter(subsciber => subsciber !== f);
    },
    notify(data) {
      observers.forEach(observer => observer.update(data));
    }
  };
}
// initialize the observer
const gameObserver = new observer();

// Create Menu Logic
const gameModel = {
  data: {
    // keep track of where the game currently is
    gameState: "menu",
    // keep track of which person is picking a character in the menu
    menuState: "player",
    // keep track of players army
    playerChoice: null,
    // keep track of enemy army
    enemyChoice: null,
    // keep track of the remaining armies
    remainingArmies: [],
    // ground or space battle
    gameLocation: "ground",
    //
    hasWon: false
  },
  init: function() {
    this.setGameState("menu");
    this.data.remainingArmies = armies.map(item => item.name);
    //this.update();
    subscriberFunction.subscribe("start-game-music");
    return this;
  },
  update: function() {
    // if player has died
    if (this.data.gameState === "playing") {
      if (this.data.playerChoice.hp <= 0) {
        // don't neet to set haswon since it is already false
        this.setGameState("end");
        //notify view compaonent of the change
        subscriberFunction.subscribe("explode").then(()=>{
          // wait till audio is done
          // tell the view to update
         gameObserver.notify(this.data);
        });
      } else if (this.data.enemyChoice.hp <= 0) {
        // if player kills all enemies
        if (this.data.remainingArmies.length === 0) {
          this.data.hasWon = true;
          this.setGameState("end");
        } else {
          // if enemy has died
          this.setMenuState("enemy");
          this.setGameState("menu");
          this.data.playerChoice.levelUp();
        }
        subscriberFunction.subscribe("explode").then(()=>{
          // wait till audio is done
          // tell the view to update
         gameObserver.notify(this.data);
        });
      }
    }
    // refire handlers after dom updates
    this.handleInput();
  },
  setGameState: function(newState) {
    // states can be menu playing end?
    this.data.gameState = newState;
  },
  setMenuState: function(state) {
    // states = ['player', 'enemy', 'ready'];
    this.data.menuState = state;
  },
  setArmy: function(armyName, user) {
    // create the army the player picks of the user specified
    let army = new createArmy(this.getArmy(armyName));
    if (user === "player") {
      this.data.playerChoice = army;
    } else {
      this.data.enemyChoice = army;
    }
  },
  getArmy: function(armyName) {
    // filter through armies to return the one the player picked
    return armies.filter(function(item) {
      if (item.name === armyName) {
        return item;
      }
    })[0];
  },
  removeArmy: function(armyName) {
    this.data.remainingArmies = this.data.remainingArmies.filter(
      item => item !== armyName
    );
  },
  setLocation: function() {
    // sets the location of the battle to specify, images to use for battle
    let locations = ["ground", "space"];
    this.data.gameLocation = locations[Math.floor(Math.random() * 2)];
  },
  handleInput: function() {
    switch (this.data.gameState) {
      case "menu":
        handleInputMenu(this);
        break;
      case "playing":
        handleInputPlaying(this);
        break;
      case "end":
        handleInputEnd(this);
        break;
    }
  },
  handleCombat: function() {
    this.data.enemyChoice.hp -= this.data.playerChoice.attack(
      this.data.enemyChoice.evasion
    );
    //keep the enemy from attaking you  after they die!!!
    if (this.data.enemyChoice.hp > 0) {
      this.data.playerChoice.hp -= this.data.enemyChoice.retaliate(
        this.data.playerChoice.evasion
      );
    }
  },
  reset() {
    // set the game to initial settings
    this.data = {
      hasWon: false,
      gameLocation: "ground",
      gameState: "menu",
      menuState: "player",
      playerChoice: null,
      enemyChoice: null,
      remainingArmies: armies.map(item => item.name)
    };
    // notify the view to update
    gameObserver.notify(this.data);
  }
};

// input handlers logical only
function handleInputMenu(context) {
  $(".menu-army").click(function() {
    if (context.data.menuState === "player") {
      // set players army
      context.setArmy($(this).attr("name"), "player");
      // move to next menuState
      context.setMenuState("enemy");
      // remove the chosen from the remaining armies
      context.removeArmy($(this).attr("name"));
    } else if (context.data.menuState === "enemy") {
      // set enemies army
      context.setArmy($(this).attr("name"), "enemy");
      // move to next menuState
      context.setMenuState("ready");
      // remove the chosen from the remaining armies
      context.removeArmy($(this).attr("name"));
      // sets the space or ground for the battle
      context.setLocation();
    }
    if (context.data.menuState === "ready") {
      // if the menu state is ready to transition set gameState = playing
      subscriberFunction.subscribe("intro");
      context.data.gameState = "playing";
    }
    //trigger view update
    gameObserver.notify(context.data);
  });
}

function handleInputPlaying(context) {
  $("#attack").on("click", function() {
    // gameModel will handle the hp
    context.handleCombat();
    // make pew noises
   subscriberFunction.subscribe("fire").then(()=>{
     // wait till audio is done
     // tell the view to update
    gameObserver.notify(context.data);
   });
  });
}

function handleInputEnd(context) {
  // todo? handle winning and losing buttons...
  $("#reset").on("click", function() {
    context.reset();
  });
}

// game view handles all visual and audio aspects
const gameView = {
  init() {
    this.previousState = "";
    return this;
  },
  update(data) {
    // use previous to make sure we are not transitioning
    if (this.previousState !== data.gameState) {
      // set previousState equal to the new state and carry on
      this.previousState = data.gameState;
      // handle visual transistions
      this.transition(data.gameState, data);
    }
    //render dom based on state
    switch (data.gameState) {
      case "menu":
        this.renderMenu(data);
        break;
      case "playing":
        this.renderPlaying(data);
        break;
      case "end":
        this.renderEnd(data);
        break;
    }
  },
  renderMenu(data) {
    // side effect is it clears the event listeners
    $("#army-wrapper").empty();
    // menu text for each player
    if (data.menuState === "player") {
      $(".menu-intro-instructions").text("Select Your Army:");
    } else if (data.menuState === "enemy") {
      $(".menu-intro-instructions").text("Select the Enemy Army:");
    }

    $.each(data.remainingArmies, function(key, army) {
      armies.forEach(function(item) {
        if (item.name === army) {
          $("#army-wrapper").append(`
             <div class='menu-army' name='${item.name}'>
               <img class='menu-army-img ${
                 item.alignment
               }' src='./assets/images/${item.picture.ground}'></img>
               <div class='menu-army-title'>
               <h2  >${item.name} | ${item.attacks}D${item.power} | HP: ${
            item.maxHp
          }</h2>
               </div>
             </div>`);
        }
      });
    });
  },
  renderPlaying(data) {
    $("#game").empty();
    $("#game").append(`
    <div class='game-wrapper'>
      <div class='game-player-wrapper'>
        <img class='game-wrapper-img' src='./assets/images/${
          data.playerChoice.picture[data.gameLocation]
        }'/>
        <div class='health-bar'>
          <p>HP: ${data.playerChoice.hp}</p>
          <div class='hpbar ${
            data.playerChoice.alignment
          }-bar' style='width: ${this.mapMaxHealth(data.playerChoice)}%'></div>
        </div>
      </div>
      <button id='attack' class='${
        data.playerChoice.alignment
      }-attack-button'>Attack</button>
      <div class='game-enemy-wrapper'>
        <img class='game-wrapper-img' src='./assets/images/${
          data.enemyChoice.picture[data.gameLocation]
        }'/>
        <div class='health-bar'>
          <p>HP: ${data.enemyChoice.hp}</p>
          <div class='hpbar ${
            data.enemyChoice.alignment
          }-bar' style='width: ${this.mapMaxHealth(data.enemyChoice)}%'></div>
        </div>
      </div>
    </div>
    `);
  },
  mapMaxHealth(army) {
    // map the hp to a percentage 50 hp -> 100% , 40 hp -> 90
    let maxHP = armies.filter(item => item.name === army.name);
    let currentHP = army.hp < 0 ? 0 : army.hp;
    return Math.floor((currentHP / maxHP[0].maxHp) * 100);
  },
  renderEnd(data) {
    // todo render end state
    $("#end").empty();
    if (data.hasWon) {
      $("#end").append(`
        <h1>You Have Conquered the Galaxy</h1>
        <button id='reset'>Play again?</button>
      `);
    } else {
      $("#end").append(`
        <h1>You have failed me for the last time.</h1>
        <button id='reset'>Play again?</button>
      `);
    }
  },
  //handle transitions from menu -> <- playing
  transition(to, data) {
    console.log("transition: ", to);
    switch (to) {
      case "menu":
        $("#end").animate({ top: "150%" }, 300, "linear",  ()=>{
          $("#game").animate({ top: "150%"}, 300, "linear",  ()=>{
            $("#menu").animate({ top: "50%" }, 300, "linear");
          });
        });
        break;
      case "playing":
        $("#menu").animate({ top: "-50%" }, 500, "linear", ()=>{
          $("#game").animate({ top: "-70%" }, 500, "linear");
        });
        break;
      case "end":
        $("#game").animate({ top: "150%" }, 500, "linear", ()=>{
          $("#end").animate({ top: "-70%" }, 500, "linear", ()=>{
            if(!data.hasWon){
              subscriberFunction.subscribe("outro");
            }
          });
        });
        break;
    }
  }
};

$(document).ready(function() {
  // todo these are dependant because of input
  // initialize the view and subscribe to data changes
  gameObserver.subscribe(gameView.init());
  // initialize the game logic and subscribe to data changes
  gameObserver.subscribe(gameModel.init());
  // call notify from gameObvserver to setup the game
  gameObserver.notify(gameModel.data);
});
