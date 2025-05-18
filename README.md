# 📝 Customer Persona Experience App — Take-Home Exercise

Welcome! This repository is for the **Customer Persona Experience App** take-home exercise.

Your goal is to build an interactive app that generates customer personas and simulates a chat experience where the user helps the persona solve a product or service challenge.

---

## 🎯 Objective

Demonstrate your skills in:
- System architecture
- UI design
- Data handling
- User interaction flows
- AI integration

---

## 🔹 Requirements

### Step 1: Company Input
- Collect the **company name** and **company characteristics** (free text or tags).

### Step 2: Persona Generation
Generate a customer persona containing:
- Name
- Age
- Gender
- Location
- Job Title
- Interests
- Challenges

### Step 3: Chat Experience
- Present a challenge from the persona related to the company's products/services.
- Allow the user to respond and assist the persona.
- Support at least 2–3 back-and-forth interactions.

---

## 🔹 Technical Constraints

- **React** app (any framework — Next.js, Remix, etc.).
- **AI-powered** persona generation and chat experience.
- Use **any AI model you want** free or paid.
- **Server-side component required** (no client-only apps).

---

## 🔍 Evaluation Criteria

- Clean, usable UI design.
- Code readability and structure.
- Effective use of AI.
- Creativity and user experience.

---

## 📦 Submission Instructions

1. Fork this repository.
2. Push code to your fork.
3. Include a `README.md` (this file) updated with any additional details you'd like to share.
4. Provide clear instructions for how to run the app locally.
5. No need to include any API keys. We will use our own for testing.

---
# Architecture Diagram

![Architecture Diagram](assets/overallArchitecture.svg)

# `Front End Web UI` 

## Web URL

https://d1080c9c9lj37d.cloudfront.net/

## Persona Assistant

Persona Assistant is a modern, mobile-friendly, single-page React application that connects to an AWS Lex V2 chatbot. It helps users generate customer personas for their company, brand, or product by chatting with an AI-powered assistant.

### Features

- Chat-based persona generation using AWS Lex V2
- Centered, elegant UI with brand logo and titles
- Fully responsive: centered card on desktop, full-screen on mobile
- Bootstrap 5 styling with custom message bubbles
- Typing indicator and professional assistant icons
- Optional mock mode (no backend needed for local testing)

## Tech Stack

| Layer               | Technology                          |
|---------------------|----------------------------------   |
| Frontend            | React (no CRA or Vite)              |
| Styling             | Bootstrap 5                         |
| Bot Integration     | AWS Lex V2 via API Gateway + Lambda |
| Hosting (optional)  | AWS S3 + CloudFront                 |
| Icons               | react-icons (configurable)          |

## Project Structure


```
persona-assistant/
├── public/                # Static assets
│   └── logo.png
├── src/
|   |-- assets/
|   |   |-- logo.png
│   ├── components/
│   │   ├── ChatComponent.jsx
│   │   └── MessageBubble.jsx
│   ├── App.jsx
│   └── index.js
├── webpack.config.js
├── .babelrc
├── package.json
└── README.md
```
**Sample Rest API Payload**

 ```json
  {
    "sessionId":"sess-1747545307389",
    "text":"Hello"
  }
 ```

## Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/your-username/take-home-exercise.git
cd MyPersonaGen
````

2. Install dependencies

```bash
npm install
```

3. Run in development mode

```bash
npx webpack serve
```

4. Open in browser

```
http://localhost:3000
```

## Deployment (S3 + CloudFront)

1. Build for production

```bash
npx webpack --mode production
```

2. Sync to S3

```bash
aws s3 sync dist/ s3://your-bucket-name --acl public-read
```

3. Set up CloudFront for HTTPS and CDN support

## AWS Lex Bedrock Integration (via Lambda)

This app calls Lex using the following synchronous pattern:

```
SPA → API Gateway → Lambda → Lex V2 -> Lambda (Bedrock Guardrails - Toxicity Check) -> bedrock AI
```

## Mock Mode

To test without connecting to AWS:

* Enable mock logic in `ChatComponent.jsx` by simulating responses locally.
* Useful for UI development without backend setup.

---


# `Back End AWS` 


## Pre Cloudformation Deployment steps

**Note - Before starting stack submission**
 - please configure bedrock guardrails and note 
    - GuardrailId 
    - GuardrailVersion - This will default to 1. But may change in the future.
 - The guardrails should detect and block
    - Toxicity
    - Hate speech
    - Violence
    - Abuse
    - Insults
    - politics
    - religion
    - self-harm
 - The Guardrail should be invoked by the lambda function before sending prompts to claude
 - if the guardrail has Prompt attacks enabled (Enable to detect and block user inputs attempting to override system instructions.), to avoid misclassifying system prompts as a prompt attack and ensure that the filters are selectively applied to user inputs, use input tagging.<br/>

 

 - Configure bedrock with the LLM model of your choice. List of supported models can be round at [https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html] .Note the model id for the model of your choice.ClaudeModelId
 - All the lambdas use NodeJs 18 with AWS SDK v3

## CloudFormation Deployment Order (Hybrid Modularization for stacks )


1. iam-stack.yaml
2. ssm-bedrock-config.yaml
3. persona-dynamodb-stack.yaml
3. lambda-stack.yaml
4. stepfunction-stack.yaml
6. api-gateway-stack.yaml

**Configure Amazon Lex post deployment. Lex doesnot yet have full cloudformation support**

## Hybrid Modularization Breakdown: Functional vs. Lifecycle-Aligned Stacks with SSM-Based Inter-Stack Communication

The below table support the use of SSM parameters vs import/export for cross stack communication
| Feature                      | **SSM Parameters**                                       | **CloudFormation Export/Import**                  |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Cross-Stack Referencing      | Flexible (can reference outside of CFN)                  | Works within same region/account                |
| Loose Coupling               | Very loose — stacks don’t depend on each other’s state   | Tight coupling — dependencies at stack level    |
| Stack Updates                | Can update without dependency reordering                 | Must update dependent stacks last               |
| Access Control               | Fine-grained IAM control via `ssm:GetParameter`          | No access control — relies on CFN internal refs |
| Dev/Test/Prod Flexibility    | Easy to override with different values                   | Must re-export/import or duplicate              |
| Debugging Simplicity         | Parameters visible in SSM console                        | Harder to trace in CFN UI                       |
| Referencing from Code        | APIs, SDKs, Lambdas can read SSM directly                | Not usable outside CloudFormation               |
| Stack Independence           | Deploy/redeploy in any order                             | Strict deployment order (parent → child)        |

### FUNCTION-BASED STACKS:  These group resources by what they do
1. iam-stack.yaml - Roles are foundational and reusable
2. ssm-bedrock-config.yaml - Global system config, centrally defined
3. frontend-stack.yaml - Dedicated to frontend delivery
### LIFECYCLE-BASED STACKS: These group resources based on how often they’re expected to change
1. lambda-stack.yaml - Lambdas change frequently (logic, models)
2. lex-stack.yaml - Lex needs tuning as you improve UX/NLU

---

## "Why Choose a Lex Chatbot Over Directly Calling Amazon Bedrock for Your AI Applications?"
But you **should use Lex** when you want:

* Voice interaction
* Guided, multi-step conversation
* Intent/slot routing
* Natural fallback/error handling
* Quick integration with contact centers or support apps

### Lex Advantages

* Lex handles:

  * **Intent classification** (e.g., “Generate a persona” vs. “Cancel”)
  * **Slot filling** (e.g., `CompanyName`, `Characteristics`)
  * **Multi-turn dialogs** (e.g., asking "What are the characteristics?" if missing)

This saves you from writing custom code to parse and manage user input structure.


### 2. **Voice and Multimodal Interfaces**

* Lex is fully integrated with:

  * **Amazon Connect** (voice bots)
  * **Alexa**
  * **Web/mobile SDKs**

If you want your bot available on voice or omnichannel platforms, Lex is plug-and-play.

### 3. **Guardrails, Fallbacks, Re-prompts, and Error Handling**

* Lex provides built-in:

  * FallbackIntent
  * Context-aware dialogs
  * Re-prompting for required slots

You can embed these as safety layers before even reaching Bedrock.

### 4. **Focus Bedrock on the Creativity/Reasoning Layer**

* Let Lex handle structure and user flow.
* Let **Bedrock (Claude)** handle the open-ended language generation:

  * Persona generation
  * Summaries
  * Creative outputs

Each system does what it does best.

### 5. **Analytics, Versioning, and Tuning**

* Lex provides:

  * Analytics (intent success rates, slot dropout)
  * Multiple bot versions
  * A/B testing

You get enterprise-grade chatbot management without building it from scratch

---


###Additional Notes###

All Lambdas follow ***Single Responsibility Principle***



---







