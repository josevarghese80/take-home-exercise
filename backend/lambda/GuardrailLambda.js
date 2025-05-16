import { BedrockRuntimeClient, InvokeGuardrailCommand } from "@aws-sdk/client-bedrock-runtime";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const region = process.env.AWS_REGION;
const guardrailId = process.env.GUARDRAIL_ID;
const guardrailVersion = process.env.GUARDRAIL_VERSION;
// const ssm = new SSMClient({ region });
const bedrock = new BedrockRuntimeClient({ region });

export const handler = async (event) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event;
  const { companyName, characteristics, userInput } = body;

  // const guardrailId = await ssm.send(new GetParameterCommand({
  //   Name: "/persona/bedrock/GuardrailId"
  // })).then(res => res.Parameter?.Value);

  // const guardrailVersion = await ssm.send(new GetParameterCommand({
  //   Name: "/persona/bedrock/GuardrailVersion"
  // })).then(res => res.Parameter?.Value);

  const checkText = userInput || `${companyName} ${characteristics}`;

  const result = await bedrock.send(new InvokeGuardrailCommand({
    guardrailIdentifier: guardrailId,
    guardrailVersion: guardrailVersion,
    input: checkText,
    inputType: "user" // avoids classifying your system prompt as a prompt attack
  }));

  if (result.blocked) {
    throw new Error("Input blocked by guardrail");
  }

  return { statusCode: 200, body: JSON.stringify({ result: "safe" }) };
};
