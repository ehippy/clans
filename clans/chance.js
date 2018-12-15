
module.exports.runNow = function (slack) {

  slack.conversations.list().then((res) => {
    console.log('Convo list: ', res);

    const channels = res.channels
    for (let index = 0; index < channels.length; index++) {

      if (Math.random() < 0.1) {
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
function generateRandomEncounter(channelId) {

  const encounter = getEncounterFlavor();

  return {
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

  function getPickups() {
    const pickups = [];
    const usedFlavors = [];
    const numItems = Math.ceil(Math.random() * 4);

    for (let index = 0; index < numItems; index++) {
      var flavor = getRandomItem();

      if (usedFlavors.indexOf(flavor)>-1){
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

