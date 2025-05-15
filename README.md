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

## CloudFormation Deployment Order (Hybrid Modularization for stacks )
1. iam-stack.yaml
2. ssm-bedrock-config.yaml
3. lambda-stack.yaml
4. lex-stack.yaml
5. frontend-stack.yaml
## Hybrid Modularization Breakdown: Functional vs. Lifecycle-Aligned Stacks
### FUNCTION-BASED STACKS:  These group resources by what they do
1. iam-stack.yaml - Roles are foundational and reusable
2. ssm-bedrock-config.yaml - Global system config, centrally defined
3. frontend-stack.yaml - Dedicated to frontend delivery
### LIFECYCLE-BASED STACKS: These group resources based on how often they’re expected to change
1. lambda-stack.yaml - Lambdas change frequently (logic, models)
2. lex-stack.yaml - Lex needs tuning as you improve UX/NLU

