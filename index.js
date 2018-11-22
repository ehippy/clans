'use strict';

const { WebClient } = require('@slack/client');

const token = '';
 
const slack = new WebClient(token);

const serverless = require('serverless-http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/spam', function (req, res) {
  // slack.chat.postMessage({
  //   channel: 'C6U2DJNCC',
  //   text: 'hello to you!'
  // }).then((res) => {
  //   // `res` contains information about the posted message
  //   console.log('Message sent: ', res);
  // });
  res.send('Spammed!')
})

app.post('/event', function (req, res) {
  console.log('Event: ', req.body)

  if (req.body.challenge) {
    return res.send(req.body.challenge)
  }

  if (req.body.event.type == 'app_mention') {
    slack.chat.postMessage({
      username: 'mother',
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

module.exports.handler = serverless(app);
