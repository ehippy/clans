
module.exports.replyToMention = async function (res, slack, event) {


    //starting a clan
    if (event.text.indexOf('start') && event.text.indexOf('clan')) {
        return await postAsMother(slack, event.channel, 'You would like to start a clan?');
    }


    const postResult = await postAsMother(slack, event.channel, 'I hear you, <@' + event.user + '>');
    res.send('ok');

}

function postAsMother(slack, channel, text) {

    return new Promise(resolve => {
        slack.chat.postMessage({
            username: 'Mother',
            channel: channel,
            text: text
        }).then((res) => {
            console.log('Message sent: ', res);
            resolve(res);
        })
            .catch((err) => {
                console.log('postAsMother Error: ', err);
                resolve(err);
            });
    });
}