const { SFNClient, StartSyncExecutionCommand } = require("@aws-sdk/client-sfn");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand,UpdateCommand} = require("@aws-sdk/lib-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const region = process.env.AWS_REGION;
const sfn = new SFNClient({ region });
const dynamo = new DynamoDBClient({ region });
const dynamoDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region })
);
const tableName = process.env.TABLENAME;
const personaStepFunctionARN = process.env.PERSONA_STEPFUNCTION_ARN;


/**
 * Starts the persona step function with the given input payload.
 * @param {string} stateMachineArn - The ARN of the Step Function.
 * @param {object} inputPayload - The payload to pass to the state machine.
 * @returns {Promise<object>} - The Step Function execution response.
 */
async function startPersonaStepFunction(stateMachineARN, inputPayload) {
  console.log(`stateMachineARN ${stateMachineARN} inputPayload ${JSON.stringify(inputPayload, null, 2)}`)
  const command = new StartSyncExecutionCommand({
    stateMachineArn: stateMachineARN,
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
async function putPersonaSession(tableName, sessionId, personaText) {

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


/**
 * Retrieves session data from DynamoDB using SessionId as the key.
 * @param {string} tableName - The DynamoDB table name.
 * @param {string} sessionId - The session ID to query.
 * @returns {Promise<object|null>} - The session item or null if not found.
 */
async function getSessionData(tableName, sessionId) {
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      SessionId: sessionId,
    },
  });

  try {
    const result = await dynamoDocClient.send(command);
    return result.Item || null;
  } catch (error) {
    console.error("Error fetching session data:", error);
    throw error;
  }
}

/**
 * Appends a new chat turn to the ChatHistory array in DynamoDB for a given session.
 * @param {string} tableName - DynamoDB table name.
 * @param {string} sessionId - Session ID (partition key).
 * @param {object} newTurn - Object with `user` and `ai` fields.
 * @returns {Promise<void>}
 */
async function updateChatHistory(tableName, sessionId, newTurn) {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { SessionId: sessionId },
      UpdateExpression: "SET ChatHistory = list_append(if_not_exists(ChatHistory, :emptyList), :newTurn)",
      ExpressionAttributeValues: {
        ":newTurn": [newTurn],
        ":emptyList": [],
      },
    });

    await dynamoDocClient.send(command);
    console.log(`Chat history updated for session: ${sessionId}`);
  } catch (error) {
    console.error("Failed to update chat history:", error);
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
    responseMessage = await startPersonaStepFunction(personaStepFunctionARN, snsPayload);
    await putPersonaSession(tableName, sessionId, responseMessage);

  } else if (intentName === "FallbackIntent") {
    console.log('Fall bacvk intent')
    //Get session data from dynamo db

    let sessionData = await getSessionData(tableName, sessionId)
    console.log(`sessionData ${JSON.stringify(sessionData, null, 2)}`)

    //***** TBD If Persona is not defined or blank respond saying I dont see company details. Would you like to generate a persona. Please respond with either yes I would like to generate a persona else respond "No or Im not intrested"


    // If Persona is present get add the user question to chat history.
    let userText = event.inputTranscript;
    snsPayload.personaPrompt = sessionData.Persona
    snsPayload.chatHistory = sessionData.ChatHistory
    snsPayload.userInput = userText
    
    // Send the data to StepFunction. Get the response back, add that to chat history //Send the response to the user
    responseMessage = await startPersonaStepFunction(personaStepFunctionARN, snsPayload);
    console.log(`response message from stepdfunction ${JSON.stringify(responseMessage, null, 2)}`)

    //Add the initial user question and response to chat history in dynamodb
    const newUserInput = userText;
    const newAIResponse = responseMessage;
    let newTurn = { user: newUserInput, ai: newAIResponse };
    let updateRes = await updateChatHistory(tableName,sessionId,newTurn);
    console.log(`update status ${JSON.stringify(updateRes,null,2)}`)

  
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
