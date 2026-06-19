# Technical Implementation Plan: Relocation AI Agent & USDC Commerce

This document outlines the step-by-step implementation guide for the Relocation AI Agent.

---

## ⚠️ Critical Points & Risk Evaluation

Before starting, we identify the main points of failure in this plan and the mitigations to ensure a flawless hackathon demo:

| Critical Point               | Risk Description                                                                                                         | Mitigation (Demo-Safe)                                                                                                       |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **API Keys & Network**       | If Gemini or Tavily API keys are missing, rate-limited, or face latency, the AI chat and research will crash.            | **Demo Fallback**: Implement static fallback mock search results and pre-baked agent responses if API keys are not provided. |
| **Web3 RPC Reliability**     | Reading transaction receipts on Polygon Amoy testnet can fail due to public RPC rate limits or network congestion.       | **Developer Toggle**: Add a "Demo Bypass / Force Unlock" button in the UI settings that overrides payment verification.      |
| **CORS / Docker Networking** | Frontend running in container B needs to speak to Backend in container A. Hardcoding `localhost` can fail inside Docker. | Configure CORS properly in Express, and use a relative or environment-variable based API URL prefix (`BACKEND_URL`).         |
| **Dependency Creep**         | Adding arbitrary packages mid-hackathon introduces version mismatches and build bugs.                                    | **Strict Rule**: Freeze dependencies to those defined in this plan. **Do not install any new npm packages.**                 |

---

## 🔌 API Endpoint Specifications

### 1. User Profile & Recommendation

- **Path**: `POST /api/profile`
- **Request**: User personal data.
- **Response**: Custom recommendations. No DB persistence.

### 2. Agent Chat

- **Path**: `POST /api/chat`
- **Request**: `{ messages: Message[], profile: UserProfile }`
- **Response**: Text stream (SSE) grounded in Tavily research.

### 3. Payment Verification

- **Path**: `POST /api/payment/verify`
- **Request**: `{ txHash: string }`
- **Response**: `{ success: boolean, paymentToken: string }` (Polygon Amoy check).

### 4. PDF Form Generator

- **Path**: `POST /api/form/fill`
- **Request**: `{ paymentToken: string, profile: UserProfile }`
- **Response**: `application/pdf` binary stream.

---

## 🛠️ Step-by-Step Implementation Plan

> [!IMPORTANT]
> **Strict Checkpoint Rule**: Run verification after each step and Git commit before proceeding to the next step.

### 🖥️ PHASE 1: BACKEND IMPLEMENTATION (Folder: `/backend`)

#### Step B1: Project Setup, Docker & Local MCP

Scaffold the Node/Express backend with TypeScript and configure Docker.

- **Action**:
  - Initialize `/backend` folder.
  - Setup `package.json` with **only** predefined dependencies: `express`, `cors`, `dotenv`, `pdf-lib`, `viem`, `@google/genai`, `typescript`, `@types/node`, `@types/express`, `@types/cors`.
  - Create `/backend/Dockerfile` (Node 20 Alpine).
  - Setup `.env` and `.agents/mcp_config.json` inside the root workspace.
- **Checkpoint B1**:
  - `docker compose build backend` and `docker compose up backend` starts without errors.
  - Express server responds on `http://localhost:3001/`.
  - **Git Action**: Commit with message `feat: backend setup and docker config`.

---

#### Step B2: User Profile API (`/backend/src/routes/profile.ts`)

Implement the demographic rules processor.

- **Action**:
  - Write standard recommendations utility.
  - Setup `POST /api/profile` router.
- **Checkpoint B2**:
  - Send POST payload to `http://localhost:3001/api/profile` and verify JSON recommendation output.
  - **Git Action**: Commit with message `feat: add profile API endpoint`.

---

#### Step B3: Tavily Service Utility (`/backend/src/services/tavily.ts`)

Write the Tavily lookup service with mock fallback.

- **Action**:
  - Create a fetch-based Tavily client.
  - Include hardcoded mock results (Berlin registration requirements) if `TAVILY_API_KEY` is empty.
- **Checkpoint B3**:
  - Run verify script. Check that mock results are used if key is missing, and Tavily is called if key is present.
  - **Git Action**: Commit with message `feat: add tavily service with mock fallback`.

---

#### Step B4: Gemini Agent Stream Route (`/backend/src/routes/chat.ts`)

Create the streaming agent orchestrator using Gemini.

- **Action**:
  - Implement system prompt context using user profile.
  - Register `searchWeb` and `lockRelocationPack` tools.
  - Enable mock chat responses if `GEMINI_API_KEY` is not present.
- **Checkpoint B4**:
  - Test `/api/chat` route and ensure SSE stream prints agent output.
  - **Git Action**: Commit with message `feat: implement gemini streaming chat endpoint`.

---

#### Step B5: Polygon Amoy USDC Verification (`/backend/src/routes/payment.ts`)

Implement tx confirmation using `viem`.

- **Action**:
  - Validate tx receipt status, recipient, and amount.
  - Add bypass toggle validation if dev mode is enabled.
- **Checkpoint B5**:
  - Send tx hash to `/api/payment/verify` and verify output.
  - **Git Action**: Commit with message `feat: implement polygon verify endpoint`.

---

#### Step B5: PDF Form Filler (`/backend/src/routes/form.ts`)

Map profile properties to `/public/templates/Berlin_Anmeldung.pdf`.

- **Checkpoint B6**:
  - Verify route outputs a valid pre-filled PDF download.
  - **Git Action**: Commit with message `feat: add pdf form filler service`.

---

### 🎨 PHASE 2: FRONTEND IMPLEMENTATION (Folder: `/frontend`)

#### Step F1: React + Vite Boilerplate & Layout

- **Action**:
  - Scaffold `/frontend` using Vite template.
  - Configure `Dockerfile` and minimalist split-screen layout.
- **Checkpoint F1**: `docker compose up frontend` serves layout on `http://localhost:3000/`.
  - **Git Action**: Commit with message `feat: frontend structure and styling`.

#### Step F2: Wallet & USDC Transaction Trigger

- **Checkpoint F2**: MetaMask connects and launches transfer requests.
  - **Git Action**: Commit with message `feat: add wallet integration`.

#### Step F3: Chat Component & Dynamic Checklist

- **Checkpoint F3**: Streams chat messages and marks checklist steps.
  - **Git Action**: Commit with message `feat: build chat stream view`.

#### Step F4: End-to-End Unlock Flow

- **Checkpoint F4**: Complete full assistant flow: chat -> pay -> download PDF.
  - **Git Action**: Commit with message `feat: finish MVP relocation app`.
