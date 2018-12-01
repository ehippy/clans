
module.exports.runNow = function (slack) {

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
