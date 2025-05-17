const { SFNClient, StartSyncExecutionCommand } = require("@aws-sdk/client-sfn");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const region = process.env.AWS_REGION;
const sfn = new SFNClient({ region });
// const ssm = new SSMClient({ region });
const dynamo = new DynamoDBClient({ region });
const tableName = process.env.TABLENAME;
const personaStepFunctionARN = process.env.PERSONA_STEPFUNCTION_ARN;


/**
 * Starts the persona step function with the given input payload.
 * @param {string} stateMachineArn - The ARN of the Step Function.
 * @param {object} inputPayload - The payload to pass to the state machine.
 * @returns {Promise<object>} - The Step Function execution response.
 */
async function startPersonaStepFunction(stateMachineARN,inputPayload) {
  console.log(`stateMachineARN ${stateMachineARN} inputPayload ${JSON.stringify(inputPayload,null,2)}`)
  const command = new StartSyncExecutionCommand({
    stateMachineArn:stateMachineARN,
    input: JSON.stringify(inputPayload),
  });
  let responseMessage = "Please try again later"
  try {
    const execution = await sfn.send(command);
    const output = JSON.parse(execution.output || "{}");
    const bedrockResponse = JSON.parse(output.body);
    responseMessage = bedrockResponse.answer;
    responseMessage = `${responseMessage}. Would you like to ask me more questions about my company`;
    console.log(JSON.stringify(responseMessage, null, 2));
  } catch (error) {
    console.error("Failed to start Step Function:", error);
    throw error;
  }
  return responseMessage;


}




/**
 * Stores persona session data into DynamoDB.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {string} sessionId - The session ID.
 * @param {string} personaText - The generated persona description/message.
 * @returns {Promise<void>}
 */
async function putPersonaSession(tableName,sessionId,personaText) {
  const item = {
    SessionId: sessionId,
    Persona: personaText,
    ChatHistory: [],
  };

  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(item, { removeUndefinedValues: true }),
  });

  try {
    await dynamo.send(command);
    console.log(`Stored persona session for SessionId: ${sessionId}`);
  } catch (error) {
    console.error("Failed to write to DynamoDB:", error);
    throw error;
  }
}


exports.handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`)
  let intentName = event.sessionState.intent.name;
  console.log(`intent is ${JSON.stringify(event.sessionState.intent.name, null, 2)}`)
  let snsPayload = {};
  const sessionId = event.sessionId;
  let responseMessage = '';
  let intentState = 'Fulfilled'
  if (intentName === "GetPersonaIntent") {


    snsPayload.companyName = event.sessionState.intent.slots.companyname.value.originalValue;
    snsPayload.characteristics = event.sessionState.intent.slots.characteristics.value.originalValue;
    snsPayload.generatePersona = 'y';
    responseMessage = await startPersonaStepFunction(personaStepFunctionARN,snsPayload);
    await putPersonaSession(tableName,sessionId,responseMessage);
  } else if (intentName === "FallbackIntent") {
    console.log('Fall bacvk intent')
    responseMessage = "You are in the fall back intent";
  } else {
    responseMessage = "Hi there! We had trouble personalizing your greeting.";
    intentState = "Failed";
  }
  
  return {
    sessionState: {
      dialogAction: {
        type: "Close"
      },
      intent: {
        name: intentName,
        state: intentState
      }
    },
    messages: [{
      contentType: "PlainText",
      content: responseMessage
    }]
  };


};
