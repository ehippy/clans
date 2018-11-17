'use strict';

module.exports.mention = async (event, context) => {

  let parsedBody;

  try {
    parsedBody = JSON.parse(event.body)
  } catch (e) {
    console.log('could not parse body')
    return {
      statusCode: 400,
      body: "bad request",
    };
  }

  console.log("Request", parsedBody)

  if (parsedBody.challenge) {
    console.log('Challenge accepted!')
    return {
      statusCode: 200,
      body: JSON.stringify(parsedBody.challenge),
    };
  }

  console.log('sent hello back')
  return {
    statusCode: 200,
    body: {
      text: 'you rang?'
    },
  };
};

//clans.chat