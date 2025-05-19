const { BedrockRuntimeClient, ApplyGuardrailCommand } = require("@aws-sdk/client-bedrock-runtime");

const region = process.env.AWS_REGION;
const guardrailId = process.env.GUARDRAIL_ID;
const guardrailVersion = process.env.GUARDRAIL_VERSION;
// const ssm = new SSMClient({ region });
const bedrock = new BedrockRuntimeClient({ region });

exports.handler = async (event) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event;
  const { companyName, characteristics, userInput } = body;
  const checkText = {};
  checkText.text = userInput || `${companyName} ${characteristics}`;
  console.log(`checkText is ${checkText}`)
  const input = {
    guardrailIdentifier: guardrailId,
    guardrailVersion: guardrailVersion,
    source: "INPUT",
    content: [
      {
        text: checkText
      }
    ]
  }
  console.log(`guard rail input is ${JSON.stringify(input,null,2)}`)
  const result = await bedrock.send(new ApplyGuardrailCommand(input));
  console.log(`guard rail response ${JSON.stringify(result, null, 2)}`)
  if (result.blocked) {
    throw new Error("Input blocked by guardrail");
  }

  return { statusCode: 200, body: body };
};
