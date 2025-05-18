const { LexRuntimeV2Client, RecognizeTextCommand } = require("@aws-sdk/client-lex-runtime-v2");
const region = process.env.AWS_REGION;
const client = new LexRuntimeV2Client({ region: "us-east-1" });
exports.handler = async (event) => {
  console.log(`Recieved content ${JSON.stringify(event,null,2)}`)
  try {
    let botId = process.env.LEXBOT_ID;
    let botAliasId = process.env.LEXBOT_ALIAS_ID;
    const { sessionId, text } = JSON.parse(event.body);
    const command = new RecognizeTextCommand({
      botId: botId,
      botAliasId: botAliasId,
      localeId: "en_US",
      sessionId,
      text,
    });

    const lexRes = await client.send(command);
    const message = lexRes.messages?.[0]?.content ?? "I didn’t understand that.";

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal server error." }),
    };
  }
};
