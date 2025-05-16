import { SFNClient, StartSyncExecutionCommand } from "@aws-sdk/client-sfn";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const region = process.env.AWS_REGION;
const sfn = new SFNClient({ region });
// const ssm = new SSMClient({ region });
const dynamo = new DynamoDBClient({ region });
const tableName = process.env.TABLENAME;
const personaStepFunctionARN = process.env.PERSONA_STEPFUNCTION_ARN;

export const handler = async (event) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event;
  const { companyName, characteristics } = body;
  const sessionId = body.sessionId || `sess-${Date.now()}`;

  if (!companyName || !characteristics) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing inputs" }) };
  }

  // const stepFnArn = await ssm.send(new GetParameterCommand({
  //   Name: personaStepFunctionARN
  // })).then(res => res.Parameter?.Value);

  const execution = await sfn.send(new StartSyncExecutionCommand({
    stateMachineArn: personaStepFunctionARN,
    input: JSON.stringify({ companyName, characteristics })
  }));

  const output = JSON.parse(execution.output || "{}");
  const personaPrompt = output.persona;

  await dynamo.send(new PutItemCommand({
    TableName: tableName,
    Item: marshall({ SessionId: sessionId, PersonaPrompt: personaPrompt, ChatHistory: [] })
  }));

  return { statusCode: 200, body: JSON.stringify({ sessionId, persona: personaPrompt }) };
};
