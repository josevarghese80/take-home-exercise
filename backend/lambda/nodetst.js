// Simulated input values
const prompt = "You are Ava, a helpful AI marketing persona.\n";
const userInput = "What social media platform should I start with?";
// const chatHistory = [
//   { user: "What’s a good slogan for my company?", ai: "How about: 'Powering Your Future Sustainably'?" },
//   { user: "Can you suggest a launch plan?", ai: "Sure! Start with an email campaign, followed by influencer outreach." }
// ];
chatHistory=[]
// Prompt builder logic
let fullPrompt = chatHistory
  ? `${prompt}${chatHistory.map(t => `User: ${t.user} Assistant: ${t.ai}`).join("")} User: ${userInput}\n\nAssistant:`
  : `${prompt} User: ${userInput} Assistant:`;

// Output the result
console.log("--- Generated Prompt ---\n");
console.log(fullPrompt);
