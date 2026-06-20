# 🇩🇪 Relocation AI Agent

An AI-powered relocation assistant that helps foreigners navigate German bureaucracy, generate personalized relocation workflows, and unlock premium document packs through USDC payments on the Polygon Amoy testnet.

---

## Overview

Moving to Germany can be overwhelming due to fragmented government resources, language barriers, and complex administrative procedures.

Relocation AI Agent simplifies this process by combining:

- AI-powered guidance
- Official web research
- Personalized relocation checklists
- Automated document generation
- USDC-powered premium unlocks

The platform acts as an agentic commerce system where users can obtain tailored relocation packs and pre-filled administrative forms after completing an on-chain payment.

---

## Problem

Foreigners relocating to Germany often struggle with:

- Understanding registration requirements (Anmeldung)
- Navigating visa and residency procedures
- Obtaining tax IDs and health insurance
- Finding accurate and up-to-date government information
- Completing German-language forms correctly

These challenges lead to delays, mistakes, and unnecessary reliance on expensive consultants.

---

## Solution

The Relocation AI Agent provides:

### Personalized Guidance

The agent understands:

- Nationality
- Destination city
- Visa status
- Personal profile information

and generates tailored relocation recommendations.

### Official Information Research

The system retrieves and summarizes information from official German sources using Tavily-powered web research.

### Interactive Relocation Checklists

Users receive structured action plans that transform complex bureaucracy into clear step-by-step workflows.

### Pre-Filled Administrative Forms

After payment verification, users can generate document drafts such as:

- Berlin Anmeldung registration forms
- Relocation document packs
- Personalized administrative workflows

### USDC Commerce Layer

Premium outputs are unlocked through USDC payments on Polygon Amoy, demonstrating a complete agentic commerce workflow.

---

# Architecture

The application consists of two Dockerized services.

```text
┌─────────────────────┐
│      Frontend       │
│ React + Vite + TS   │
│ Port: 3000          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Backend        │
│ Express + Node TS   │
│ Port: 3001          │
└──────────┬──────────┘
           │
           ├── Gemini AI
           ├── Tavily Search
           ├── Polygon Amoy
           └── PDF Generation
```

---

# Tech Stack

## Frontend

- React
- Vite
- TypeScript
- MetaMask Integration

## Backend

- Node.js
- Express
- TypeScript
- pdf-lib
- viem
- Google Gemini
- Tavily Search API

## Blockchain

- Polygon Amoy Testnet
- USDC Payments
- MetaMask Wallet

## Infrastructure

- Docker
- Docker Compose

---

# Features

## AI Relocation Assistant

- Context-aware conversations
- Personalized recommendations
- Government process guidance

## Web-Grounded Research

- Retrieves information from official sources
- Structured summaries
- Relocation requirement extraction

## Interactive Dashboard

- Checklist tracking
- Progress monitoring
- Document management

## Payment Verification

- Polygon transaction validation
- USDC payment confirmation
- Premium content unlock flow

## PDF Form Generation

- Automated form filling
- Pre-populated profile data
- Downloadable PDF outputs

---

# User Flow

## 1. Create Profile

Users provide:

- First name
- Last name
- Birthdate
- Nationality

The backend processes this information in-memory and generates personalized guidance.

## 2. Chat With Agent

The user asks relocation-related questions.

The AI agent:

- Uses profile context
- Performs web research
- Returns actionable guidance

## 3. Generate Checklist

The system converts requirements into a structured relocation plan.

## 4. Complete Payment

Users pay 1 USDC on Polygon Amoy through MetaMask.

## 5. Verify Transaction

The backend validates:

- Transaction status
- Amount
- Recipient

## 6. Download Documents

Premium relocation packs and pre-filled forms become available.

---

# API Endpoints

## Profile

```http
POST /api/profile
```

Processes demographic information and returns personalized recommendations.

### Request

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1995-01-01",
  "nationality": "USA"
}
```

---

## Chat

```http
POST /api/chat
```

Runs the AI relocation assistant and streams responses.

### Request

```json
{
  "messages": [],
  "profile": {}
}
```

---

## Payment Verification

```http
POST /api/payment/verify
```

Validates Polygon Amoy USDC transactions.

### Request

```json
{
  "txHash": "0x..."
}
```

### Response

```json
{
  "success": true,
  "paymentToken": "token"
}
```

---

## Form Generation

```http
POST /api/form/fill
```

Generates a pre-filled PDF document.

### Request

```json
{
  "paymentToken": "token",
  "profile": {}
}
```

---

# Project Structure

```text
.
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
│
├── public/
│   └── templates/
│       └── Berlin_Anmeldung.pdf
│
├── .agents/
│   └── mcp_config.json
│
├── docker-compose.yml
└── README.md
```

---

# Development Setup

## Prerequisites

- Node.js 20+
- Docker
- Docker Compose
- MetaMask

---

## Environment Variables

Backend `.env`

```env
PORT=3001

GEMINI_API_KEY=
TAVILY_API_KEY=

POLYGON_RPC_URL=
USDC_CONTRACT_ADDRESS=

DEV_BYPASS=false
```

---

## Run Locally

```bash
docker compose build
docker compose up
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:3001
```

---

# Demo Safety Features

To ensure reliable hackathon demonstrations:

### AI Fallback

If Gemini or Tavily is unavailable:

- Mock search results are returned
- Predefined AI responses remain functional

### Payment Bypass

Developer mode can unlock premium features without blockchain verification.

### Docker-Safe Networking

Environment-based API routing avoids localhost container issues.

### Dependency Freeze

No additional packages should be installed during the hackathon to minimize integration risk.

---

# Future Enhancements

- Multi-city German bureaucracy support
- Visa-specific workflows
- Health insurance comparison tools
- Appointment booking assistance
- Multi-language support
- Persistent user accounts
- Additional document templates

---

# Hackathon Theme Alignment

This project demonstrates:

- Agentic AI workflows
- Real-time web research
- Automated document generation
- On-chain payment verification
- AI-powered commerce experiences

By combining intelligent reasoning, trusted information retrieval, and blockchain payments, Relocation AI Agent provides a practical example of agentic commerce for real-world relocation challenges.
