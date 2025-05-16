import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const region = process.env.AWS_REGION;
const modelId = process.env.LLM_MODEL_ID;
// const ssm = new SSMClient({ region });
const bedrock = new BedrockRuntimeClient({ region });

export const handler = async (event) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event;
  const { companyName, characteristics, personaPrompt, chatHistory, userInput } = body;

  // const modelId = await ssm.send(new GetParameterCommand({
  //   Name: "/persona/bedrock/LLMModelId"
  // })).then(res => res.Parameter?.Value);

  const prompt = personaPrompt
    || `You are an assistant for a company named ${companyName}. Traits: ${characteristics}. Introduce yourself.`;

  const fullPrompt = chatHistory
    ? `${prompt}${chatHistory.map(t => `\n\nHuman: ${t.user}\n\nAssistant: ${t.ai}`).join("")}\n\nHuman: ${userInput}\n\nAssistant:`
    : `${prompt}\n\nHuman: ${userInput}\n\nAssistant:`;

  const modelRes = await bedrock.send(new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: fullPrompt,
      max_tokens_to_sample: 300,
      temperature: 0.7,
      stop_sequences: ["\n\nHuman:"]
    })
  }));

  const reply = JSON.parse(new TextDecoder().decode(modelRes.body)).completion?.trim();
  return { statusCode: 200, body: JSON.stringify({ response: reply, persona: prompt }) };
};
