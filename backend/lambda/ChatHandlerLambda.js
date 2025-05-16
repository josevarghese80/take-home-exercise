import { SFNClient, StartSyncExecutionCommand } from "@aws-sdk/client-sfn";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";

const region = process.env.AWS_REGION;
const stepFnArn = process.env.PERSONA_STEPFUNCTION_ARN;
const tableName = process.env.TABLENAME;

// const ssm = new SSMClient({ region });
const sfn = new SFNClient({ region });
const dynamo = new DynamoDBClient({ region });

export const handler = async (event) => {
  const userInput = event?.inputTranscript || event?.UserInput || event?.body?.UserInput || "";
  const sessionId = event?.sessionState?.sessionAttributes?.sessionId || event?.sessionId || "default-session";

  const getCmd = new GetItemCommand({
    TableName: tableName,
    Key: marshall({ SessionId: sessionId })
  });
  const result = await dynamo.send(getCmd);
  if (!result.Item) throw new Error("Session not found");

  const item = unmarshall(result.Item);
  const history = item.ChatHistory || [];
  const persona = item.PersonaPrompt;

  if (history.length === 0) {
    return {
      sessionState: {
        dialogAction: { type: "Close" },
        intent: { name: "ChatWithPersonaIntent", state: "Fulfilled" }
      },
      messages: [{ contentType: "PlainText", content: persona }]
    };
  }

  // const stepFnArn = await ssm.send(new GetParameterCommand({
  //   Name: "/persona/stepfunction/PersonaOrchestrationArn"
  // })).then(res => res.Parameter?.Value);

  const stepRes = await sfn.send(new StartSyncExecutionCommand({
    stateMachineArn: stepFnArn,
    input: JSON.stringify({ personaPrompt: persona, chatHistory: history, userInput })
  }));

  const response = JSON.parse(stepRes.output);
  const reply = response.response;

  history.push({ user: userInput, ai: reply });

  await dynamo.send(new UpdateItemCommand({
    TableName: tableName,
    Key: marshall({ SessionId: sessionId }),
    UpdateExpression: "SET ChatHistory = :h",
    ExpressionAttributeValues: marshall({ ":h": history })
  }));

  return {
    sessionState: {
      dialogAction: { type: "Close" },
      intent: { name: "ChatWithPersonaIntent", state: "Fulfilled" }
    },
    messages: [{ contentType: "PlainText", content: reply }]
  };
};
