const { SFNClient, StartSyncExecutionCommand } = require("@aws-sdk/client-sfn");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const region = process.env.AWS_REGION;
const sfn = new SFNClient({ region });
// const ssm = new SSMClient({ region });
const dynamo = new DynamoDBClient({ region });
const tableName = process.env.TABLENAME;
const personaStepFunctionARN = process.env.PERSONA_STEPFUNCTION_ARN;

exports.handler = async (event) => {
  console.log(`input event ${JSON.stringify(event, null, 2)}`)
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event;
  const { companyName, characteristics } = body;

  const sessionId = body.sessionId || `sess-${Date.now()}`;

  if (!companyName || !characteristics) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing inputs" }) };
  }

  const generatePersona = 'y';
  const execution = await sfn.send(new StartSyncExecutionCommand({
    stateMachineArn: personaStepFunctionARN,
    input: JSON.stringify({ companyName, characteristics, generatePersona })
  }));

  const output = JSON.parse(execution.output || "{}");
  const persona = JSON.parse(output.body);

  console.log(JSON.stringify(persona, null, 2))

  await dynamo.send(new PutItemCommand({
    TableName: tableName,
    Item: marshall(
      { SessionId: sessionId, Persona: persona, ChatHistory: [] },
      { removeUndefinedValues: true }
    )
  }));

  return { statusCode: 200, body: JSON.stringify({ sessionId, persona: persona }) };
};
