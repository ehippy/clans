'use strict';

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

  slack.conversations.list().then((res) => {
    console.log('Convo list: ', res);

    const channels = res.channels
    for (let index = 0; index < channels.length; index++) {
      const channel = channels[index];
      if (channel.is_member) {
        slack.chat.postMessage({
          username: 'Mother',
          channel: channel.id,
          text: 'A chance encounter!',
          "attachments": [
            {
                "text": "You picked something up.",
                "fallback": "bad news",
                "callback_id": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "choice",
                        "text": "🍖",
                        "type": "button",
                        "value": "meat"
                    },
                    {
                        "name": "choice",
                        "text": "🍄",
                        "type": "button",
                        "value": "shroom"
                    }
                ]
            }
        ]
        }).then((res) => {
          console.log('Message sent: ', res);
          return res.send(req.body)
        })
        .catch((err) => {
          console.log('Error: ', err);
          return res.send(req.body)
        });
      }
    }

  })

})

app.post('/action', function (req, res) {
  const action = JSON.parse(req.body.payload)
  console.log('Action:', action)
  res.send("<@" + action.user.id + "> ate a " + action.actions[0].value)
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

module.exports.handler = serverless(app);
console.log('Started up')