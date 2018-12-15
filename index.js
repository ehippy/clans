'use strict';

var dynamoose = require('dynamoose');


var Hero = dynamoose.model('Hero',
  {
    id: String,
    pets: Object,
    inventory: Object
  }
);

const chance = require('./clans/chance.js');
const mother = require('./clans/mother.js');

const request = require('request');

const { WebClient } = require('@slack/client');

const token = '';

const slack = new WebClient(token);

const serverless = require('serverless-http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/chance', function (req, res) {
  chance.runNow(slack)
})

app.post('/action', function (req, res) {
  const action = JSON.parse(req.body.payload)
  console.log('Action:', action)


  if (action.actions[0].name == "itemPickup") {
    handleItemPickup(action, res);
  }

  if (action.actions[0].name == "petPickup") {
    const heroId = action.team.id + '-' + action.user.id;
    const details = action.actions[0].value.split(',')
    const purchaseCost = parseInt(details[0]);
    const petToGet = chance.getPetByEmoji(details[1]);

    Hero.get(heroId, function (err, hero) {
      if (err) {
        return console.log(err);
      }
      console.log("petPickup Read Hero", hero);
      if (hero.inventory === undefined) {
        hero.inventory = {};
      }
      if (hero.pets === undefined) {
        hero.pets = {};
      }

      if (hero.inventory[petToGet.eats] === undefined) {
        console.log('they had no ' + petToGet.eats);
        return petPickupFailed("Not enough " + petToGet.eats, action, function (err) {
          res.sendStatus(200);
        })
      }

      if (hero.inventory[petToGet.eats] >= purchaseCost) {
        console.log("they could afford it!");
        hero.inventory[petToGet.eats] -= purchaseCost;
        if (hero.pets[petToGet.emoji] === undefined) {
          hero.pets[petToGet.emoji] = 1;
        } else {
          hero.pets[petToGet.emoji] += 1;
        }
      } else {
        return petPickupFailed("Not enough " + petToGet.eats, action, function (err) {
          res.sendStatus(200);
        })
      }

      hero.save(function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('Saved Hero', hero);
        const response = {
          type: 'message',
          subtype: 'bot_message',
          text: action.original_message.text,
          "attachments": [
            {
              "text": "<@" + action.user.id + "> is now friend to " + hero.pets[petToGet.emoji] + " " + petToGet.emoji,
              "callback_id": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              "color": "#3AA3E3",
              "attachment_type": "default"
            }
          ]
        };
        res.send(response);
      });
    });

    function petPickupFailed(msg, action, cb) {

      console.log("petPickupFailed", msg);

      const postOptions = {
        uri: action.response_url,
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        json: {
          response_type: 'ephemeral',
          text: msg
        }
      }
    }
    request(postOptions, (error, response, body) => {
      if (error) {
        console.log("Error sending ephemeral purchase response", err);
      }
      console.log("ephemeral send done", body);
      cb();
    })
  }

})

app.post('/event', function (req, res) {
  console.log('Event: ', req.body)

  if (req.body.challenge) {
    return res.send(req.body.challenge)
  }

  if (req.body.event.type == 'app_mention') {
    mother.replyToMention(res, slack, req.body.event);
  }

})

module.exports.heartbeat = function (event, context, callback) {
  console.log('got heartbeat');
  chance.runNow(slack)
  callback(null, "word")
}

module.exports.handler = serverless(app);

function handleItemPickup(action, res) {
  const heroId = action.team.id + '-' + action.user.id;
  const pickupFlavor = action.actions[0].value;
  Hero.get(heroId, function (err, hero) {
    if (err) {
      return console.log(err);
    }
    console.log("Read Hero", hero);
    if (hero.inventory === undefined) {
      hero.inventory = {};
    }
    const val = hero.inventory[pickupFlavor];
    if (hero.inventory[pickupFlavor] === undefined) {
      hero.inventory[pickupFlavor] = 1;
    }
    else {
      hero.inventory[pickupFlavor] += 1;
    }
    hero.save(function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('Saved Hero', hero);
      const response = {
        type: 'message',
        subtype: 'bot_message',
        text: action.original_message.text,
        "attachments": [
          {
            "text": "<@" + action.user.id + "> now carries " + hero.inventory[pickupFlavor] + " " + pickupFlavor,
            "fallback": "bad news",
            "callback_id": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            "color": "#3AA3E3",
            "attachment_type": "default"
          }
        ]
      };
      res.send(response);
    });
  });
}
