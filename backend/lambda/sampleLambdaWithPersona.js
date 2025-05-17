// index.mjs
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "us-east-1" }); // Use your Bedrock region

exports.handler = async (event) => {
    try {
        const { persona, question } = event;

        if (!persona?.name || !persona?.description || !persona?.tone || !question) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required persona fields or question." })
            };
        }

        // Construct the Titan-style fused prompt
        const prompt = `
You are ${persona.name}, a product described as:
"${persona.description}"

Your tone is: ${persona.tone}

Respond in character as the product, directly addressing the user.

User's question: "${question}"

Answer as ${persona.name}:
`.trim();

        const body = {
            inputText: prompt,
            textGenerationConfig: {
                maxTokenCount: 500,
                temperature: 0.7,
                topP: 1,
                stopSequences: []
            }
        };

        const command = new InvokeModelCommand({
            modelId: "amazon.titan-text-premier-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body)
        });

        const response = await client.send(command);
        const json = JSON.parse(new TextDecoder().decode(response.body));

        return {
            statusCode: 200,
            body: JSON.stringify({
                answer: json.results?.[0]?.outputText || "(No output)"
            })
        };

    } catch (err) {
        console.error("Titan invocation error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error calling Titan model", details: err.message })
        };
    }
};
