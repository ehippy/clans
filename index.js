'use strict';

var dynamoose = require('dynamoose');


var Hero = dynamoose.model('Hero', { id: String, meat: Number, shroom: Number });


const chance = require('./clans/chance.js');

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

  const addValue = {};
  const flavor = action.actions[0].value;
  addValue[flavor] = 1

  Hero.update({id: action.team.id + '-' + action.user.id}, {$ADD: addValue, returnValues: 'UPDATED_NEW'})
  .then((dynamoResult)=>{
    console.log("dynamo add result", dynamoResult)
    res.send("<@" + action.user.id + "> now carries " + dynamoResult[flavor] + " " + flavor)
  })
  .catch((err)=>{
    console.log("dynamo add error", err)
    res.send("<@" + action.user.id + "> stumbled and skinned his knee")
  });


})

app.post('/event', function (req, res) {
  console.log('Event: ', req.body)

  if (req.body.challenge) {
    return res.send(req.body.challenge)
  }

  if (req.body.event.type == 'app_mention') {
    slack.chat.postMessage({
      username: 'Mother',
      channel: req.body.event.channel,
      text: 'I hear you, <@' + req.body.event.user + '>'
    }).then((res) => {
      console.log('Message sent: ', res);
      res.send(req.body)
    })
      .catch((err) => {
        console.log('Error: ', err);
        res.send(req.body)
      });
  }

})

module.exports.heartbeat = function(event, context, callback) {
  console.log('got heartbeat');
  chance.runNow(slack)
  callback(null, "word")
}

module.exports.handler = serverless(app);