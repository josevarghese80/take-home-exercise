const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrockRegion = process.env.AWS_REGION;
const modelId = process.env.LLM_MODEL_ID;
// const ssm = new SSMClient({ region });
const bedrock = new BedrockRuntimeClient({ region: bedrockRegion});

exports.handler = async (event) => {
  console.log(`recieved event ${JSON.stringify(event, null, 2)}`)
  // const body = typeof event.body === "string" ? JSON.parse(event.body) : event;
  const body = event.body;
  const { companyName, characteristics, personaPrompt, chatHistory, userInput, generatePersona } = body;
  console.log(`body ${JSON.stringify(body, null, 2)}`)
  let prompt = '';
  let fullPrompt='';
  if (generatePersona && generatePersona === 'y') {
    prompt = `You are ${companyName}. a product described as: ${characteristics}. Please generate a persona for this company.`
    fullPrompt = prompt;
  } else {
    personaPrompt;
    fullPrompt = chatHistory
    ? `${prompt}${chatHistory.map(t => `User: ${t.user} Assistant: ${t.ai}`).join("")} User: ${userInput}\n\nAssistant:` : `${prompt} User: ${userInput} Assistant:`;
  }
  console.log(`prompt ${JSON.stringify(prompt, null, 2)}`)
  // const prompt = personaPrompt
  //   || `You are an assistant for a company named ${companyName}. Traits: ${characteristics}. Introduce yourself.`;
  // const fullPrompt = chatHistory
  //   ? `${prompt}${chatHistory.map(t => `User: ${t.user} Assistant: ${t.ai}`).join("")} User: ${userInput}\n\nAssistant:`
  //   : `${prompt} User: ${userInput} Assistant:`;
  console.log(`fullPrompt ${JSON.stringify(fullPrompt, null, 2)}`)
  const payload = {
    inputText: fullPrompt,
    textGenerationConfig: {
      maxTokenCount: 300,
      temperature: 0.7,
      topP: 1,
      stopSequences: []
    }
  }

  // console.log(`llm payload input ${JSON.stringify(payload, null, 2)}`)
  const modelRes = await bedrock.send(new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload)
  }));

  const reply = JSON.parse(new TextDecoder().decode(modelRes.body));
  console.log(`response from LLM ${JSON.stringify({ 
      answer: reply.results?.[0]?.outputText || "(No output)"
    })}`)
  return { 
    statusCode: 200, 
    body: JSON.stringify({ 
      answer: reply.results?.[0]?.outputText || "(No output)"
    }) };
};
