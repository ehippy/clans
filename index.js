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

    const heroId = action.team.id + '-' + action.user.id;
    const pickupFlavor = action.actions[0].value;

    Hero.get(heroId, function (err, hero) {
      if (err) { return console.log(err); }
      console.log("Read Hero", hero);
      if (hero.inventory === undefined) {
        hero.inventory = {}
      }

      const val = hero.inventory[pickupFlavor];
      if (hero.inventory[pickupFlavor] === undefined) {
        hero.inventory[pickupFlavor] = 1
      } else {
        hero.inventory[pickupFlavor] += 1;
      }

      hero.save(function (err) {
        if (err) { return console.log(err); }
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


    // const addValue = {};
    // const flavor = action.actions[0].value;
    // addValue[flavor] = 1

    // Hero.update({ id: heroId }, { $ADD: addValue, returnValues: 'UPDATED_NEW' })
    //   .then((dynamoResult) => {
    //     console.log("dynamo add result", dynamoResult)
    //     res.send("<@" + action.user.id + "> now carries " + dynamoResult[flavor] + " " + flavor)
    //   })
    //   .catch((err) => {
    //     console.log("dynamo add error", err)
    //     res.send("<@" + action.user.id + "> stumbled and skinned his knee")
    //   });

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