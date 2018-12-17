
module.exports.runNow = function (slack) {

  slack.conversations.list().then((res) => {
    console.log('Convo list: ', res);

    const channels = res.channels
    for (let index = 0; index < channels.length; index++) {

      if (Math.random() < 0.8) {
        console.log("bailed on a roll");
        continue;
      }

      const channel = channels[index];
      if (channel.is_member) {
        slack.chat.postMessage(generateRandomEncounter(channel.id)).then((res) => {
          console.log('Message sent: ');
          return
        })
          .catch((err) => {
            console.log('Error: ', err);
            return
          });
      }
    }

  })

}

function generatePickupEncounterMessage(channelId) {

  const encounter = getEncounterFlavor();

  const pickupEncounter = {
    username: 'Mother',
    channel: channelId,
    text: encounter.title,
    "attachments": [
      {
        "text": encounter.body,
        "fallback": "bad news",
        "callback_id": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": getPickups()
      }
    ]
  };
  return pickupEncounter;

  function getPickups() {
    const pickups = [];
    const usedFlavors = [];
    const numItems = Math.ceil(Math.random() * 4);

    for (let index = 0; index < numItems; index++) {
      var flavor = getRandomItem();

      if (usedFlavors.indexOf(flavor) > -1) {
        continue;
      }

      usedFlavors.push(flavor);

      pickups.push({
        "name": "itemPickup",
        "text": flavor,
        "type": "button",
        "value": flavor
      });
    }
    return pickups;
  }
  function getEncounterFlavor() {

    const encounters = [
      {
        title: "Lightning struck nearby!",
        body: "You run to the strike and find... "
      },
      {
        title: "The rains swelled the creek",
        body: "Washed up on the bank there was a... "
      },
      {
        title: "A messenger from the next valley!",
        body: "They brought you a..."
      },
      {
        title: "🛸 took you above",
        body: "You were probed with a..."
      }
    ];

    return encounters[Math.floor(Math.random() * encounters.length)];
  }

  function getRandomItem() {
    const items = [
      "🍄", "🍖", "🥕", "🌶", "🍯", "🍎"
    ];
    return items[Math.floor(Math.random() * items.length)];
  }
}

function generatePetEncounter(channelId) {

  const petDice = [];
  for (let index = 0; index < pets.length; index++) {
    const pet = pets[index];
    for (let index = 0; index < pet.population; index++) {
      petDice.push(pet.emoji);
    }
  }

  const randomPetEmoji = petDice[Math.floor(Math.random() * petDice.length)]
  const randomPet = getPetByEmoji(randomPetEmoji);

  const petCost = Math.ceil(Math.random()*5) + 5;

  const petEncounter = {
    username: 'Mother',
    channel: channelId,
    text: "You entered a clearing and saw a " + randomPetEmoji,
    "attachments": [
      {
        "text": "It will be your friend for " + petCost + " " + randomPet.eats,
        "fallback": "bad news",
        "callback_id": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        "color": "#50ba5f",
        "attachment_type": "default",
        "actions": [
          {
            "name": "petPickup",
            "text": "OMG! I want a " + randomPetEmoji + " !!!",
            "type": "button",
            "value": petCost + ',' + randomPetEmoji
          }
        ]
      }
    ]
  };
  return petEncounter;
}

function generateRandomEncounter(channelId) {

  if (Math.random() < 0.1)
    return generatePetEncounter(channelId);

  return generatePickupEncounterMessage(channelId);

}

function getPetByEmoji(emoji) {
  for (let index = 0; index < pets.length; index++) {
    const pet = pets[index];
    if (pet.emoji == emoji) return pet;
  }
}
module.exports.getPetByEmoji = getPetByEmoji;

const pets = [
  {emoji: '🐅', population: 1, eats: '🍖'},
  {emoji: '🦊', population: 5, eats: '🍖'},
  {emoji: '🐕', population: 10, eats: '🍖'},

  {emoji: '🐨', population: 1, eats: '🍄'},
  {emoji: '🐒', population: 5, eats: '🍄'},
  {emoji: '🦉', population: 10, eats: '🍄'},

  {emoji: '🐹', population: 1, eats: '🥕'},
  {emoji: '🐇', population: 5, eats: '🥕'},
  {emoji: '🐐', population: 10, eats: '🥕'},

  {emoji: '🦄', population: 1, eats: '🍎'},
  {emoji: '🐴', population: 5, eats: '🍎'},
  {emoji: '🐮', population: 10, eats: '🍎'},

  {emoji: '🦂', population: 1, eats: '🍯'},
  {emoji: '🐝', population: 5, eats: '🍯'},
  {emoji: '🐞', population: 10, eats: '🍯'},

  {emoji: '🐲', population: 1, eats: '🌶'},
  {emoji: '🦖', population: 5, eats: '🌶'},
  {emoji: '🐸', population: 10, eats: '🌶'},
];

module.exports.pets = pets;