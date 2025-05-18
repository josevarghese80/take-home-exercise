// const AWS = require('aws-sdk');
// const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let intent = event.sessionState.intent.name;
    console.log(`intent is ${JSON.stringify(event.sessionState.intent.name, null, 2)}`)
    const userId = event.sessionId || event.inputTranscript || 'guest';
    const greeting = '';

    if (intentName === "GetPersonaIntent") {

        let companyname = event.sessionState.intent.slots.companyname.value.originalValue
        let characteristics = event.sessionState.intent.slots.characteristics.value.originalValue


    } else if (intentName === "PersonaIntent") {
        // Use previously gathered data to generate a persona
    } else {
        // Fallback or error
    }
    try {
        // const data = await dynamodb.get({
        //     TableName: 'UserGreetings',
        //     Key: { userId }
        // }).promise();



        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: intent,
                    state: "Fulfilled"
                }
            },
            messages: [{
                contentType: "PlainText",
                content: greeting
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: intent,
                    state: "Failed"
                }
            },
            messages: [{
                contentType: "PlainText",
                content: "Hi there! We had trouble personalizing your greeting."
            }]
        };
    }
};
