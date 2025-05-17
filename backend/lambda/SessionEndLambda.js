const { DynamoDBClient, UpdateItemCommand } = require( "@aws-sdk/client-dynamodb");
const { marshall } = require( "@aws-sdk/util-dynamodb");

const region = process.env.AWS_REGION;
const tableName = process.env.TABLENAME;
const dynamo = new DynamoDBClient({ region });
// const tableName = "PersonaSessionTable";

exports.handler = async (event) => {
  const sessionId = event?.sessionId || (event?.body ? JSON.parse(event.body).sessionId : null);
  if (!sessionId) return { statusCode: 400, body: JSON.stringify({ message: "Missing sessionId" }) };

  await dynamo.send(new UpdateItemCommand({
    TableName: tableName,
    Key: marshall({ SessionId: sessionId }),
    UpdateExpression: "REMOVE PersonaPrompt, ChatHistory SET Active = :false",
    ExpressionAttributeValues: marshall({ ":false": false })
  }));

  return { statusCode: 200, body: JSON.stringify({ message: "Session ended." }) };
};
