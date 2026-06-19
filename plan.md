🧠 HACKATHON PROJECT SPEC — AI AGENTIC RELOCATION PLATFORM (GERMANY)

============================================================
🎯 CORE IDEA
============================================================
We are building an AI-powered relocation assistant for foreigners moving to Germany.

The system helps users understand bureaucracy, gather official requirements, and generate structured, pre-filled administrative document drafts (like the Berlin Anmeldung address registration form).

It is an agentic commerce platform where advanced outputs (personalized relocation packs, forms, and workflows) are unlocked via USDC payments on the Polygon Amoy testnet.

============================================================
🧩 PROBLEM STATEMENT
============================================================
Foreigners moving to Germany face major friction:
- Complex and fragmented government websites.
- Confusing administrative processes (Anmeldung, visa, tax ID, health insurance).
- Language barriers (German-only documentation).
- Manual form filling across multiple institutions.
- No centralized relocation guidance system.

Result: high stress, errors, delays, and dependence on expensive consultants.

============================================================
💡 PROPOSED SOLUTION
============================================================
An AI Relocation Agent that:
1. Understands user context (country of origin, city in Germany, visa status) gathered via profile metadata.
2. Uses web research (Tavily) to retrieve official government information.
3. Extracts and structures requirements into clear steps.
4. Generates personalized relocation checklists and document packs.
5. Produces pre-filled administrative form drafts (like Berlin Anmeldung PDF).
6. Unlocks premium outputs via USDC payment verified on the Polygon Amoy testnet.

============================================================
🏗️ SYSTEM ARCHITECTURE (DOCKER COMPOSE)
============================================================
The application runs as two separated services linked via Docker Compose:

### 🖥️ FRONTEND SERVICE (React + Vite + TypeScript)
A minimalistic chat-based and dashboard UI for interacting with the agent.
- **Port**: `3000`
- **Pages**:
  - `/chat` → main AI interaction interface (split screen: chat on left, workspace dashboard on right).
  - `/dashboard` → saved checklists + payment gateway + document downloads.
- **UI Components**:
  - Wallet connector (MetaMask integration for Polygon Amoy USDC).
  - Checklists and dynamic guides.
  - PDF document download panel.

### 🧠 BACKEND SERVICE (Express + Node + TypeScript)
Central intelligence system coordinating all tools.
- **Port**: `3001`
- **Structure**:
  - `/api/profile` → Endpoint processing personal demographic data in-memory (no database persistence for privacy/demo speed).
  - `/api/chat` → Main endpoint running the Gemini agent reasoning, equipped with Tavily search tools.
  - `/api/payment/verify` → Transaction checking service reading receipts from Polygon Amoy RPC via `viem`.
  - `/api/form/fill` → Document filler creating pre-filled PDFs using `pdf-lib`.

============================================================
🔌 LOCAL TOOLING (MCP LAYERS)
============================================================
The workspace configurations (`.agents/mcp_config.json` and `.agent/mcp_config.json`) contain local server registrations for the agent's MCP servers:
- **Tavily MCP**: Local node-based research tool using `tavily-mcp`.
- **Circle MCP**: Remote HTTP/SSE server configured via `"serverUrl": "https://api.circle.com/v1/codegen/mcp"`.

============================================================
🔁 END-TO-END WORKFLOW
============================================================
1. **User Profile**: User inputs basic personal data (First Name, Last Name, Birthdate, Nationality). Backend processes it in-memory to generate initial tips and rules.
2. **Intent Parsing**: User asks the agent a question. The agent utilizes the profile metadata as background context.
3. **Web Research**: The agent calls Tavily to get verified instructions from official German portals (e.g. Berlin.de).
4. **Structuring**: Results are displayed as an interactive relocation checklist in the dashboard workspace.
5. **USDC Payment**: To unlock pre-filled documents, user triggers a 1 USDC transaction via MetaMask. The backend verifies the transaction hash on Polygon Amoy.
6. **Form Filling**: The backend fills the official Berlin Anmeldung PDF fields with the user's profile data and sends the compiled PDF back to the user.

============================================================
🏆 HACKATHON POSITIONING & DEMO SAFETY
============================================================
- **Agentic Commerce**: Combines AI reasoning, web grounding, and instant USDC payments.
- **Strict Dependency Freeze**: No new npm packages will be installed mid-development to prevent build bugs.
- **Bypass Safeguards**: The payment verification and Gemini agent endpoints will support developer mock-bypasses to guarantee a functioning demo even in case of network outages or RPC bottlenecks.
