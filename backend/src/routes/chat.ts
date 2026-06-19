import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { searchTavily } from '../services/tavily.js';
import dotenv from 'dotenv';

dotenv.config();

export const chatRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Message structure matching the request
interface Message {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  birthdate: string;
  nationality: string;
  targetCity: string;
  visaStatus: string;
  relocationDate: string;
}

interface ChatRequest {
  messages: Message[];
  profile: UserProfile;
}

chatRouter.post('/api/chat', async (req, res) => {
  const { messages, profile } = req.body as ChatRequest;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages payload' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (e.g. Nginx)

  const systemPrompt = `You are a helpful, professional AI Relocation Assistant helping foreigners move to Germany.
User Profile:
- Name: ${profile?.firstName || 'Guest'} ${profile?.lastName || ''}
- Nationality: ${profile?.nationality || 'Not specified'}
- Target City: ${profile?.targetCity || 'Germany'}
- Visa Status/Intended visa: ${profile?.visaStatus || 'Employment'}
- Target Relocation Date: ${profile?.relocationDate || 'Not specified'}

Guidelines:
1. Incorporate the user's profile details into your responses where relevant.
2. Ground your advice in real processes. If the user asks about address registration, explain the Anmeldung. If they are from a non-EU country, explain the visa steps.
3. Be concise and friendly. Format your output clearly using markdown.
4. Let the user know they can unlock a pre-filled registration form and detailed personalized relocation package by using the simulated USDC payment.
5. If the user asks general or specific questions about the relocation steps, answer them using facts.`;

  // 1. Check if Gemini API Key is missing, run simulated stream
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PLACEHOLDER')) {
    console.log('[Chat Route] Gemini API key missing. Using simulated streaming.');
    return streamMockResponse(messages, profile, res);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // We will do a quick Tavily pre-grounding if the user's latest query is about relocation requirements.
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    let groundingContext = '';
    
    const needsSearch = lastUserMessage.toLowerCase().includes('anmeldung') ||
                        lastUserMessage.toLowerCase().includes('register') ||
                        lastUserMessage.toLowerCase().includes('visa') ||
                        lastUserMessage.toLowerCase().includes('insurance') ||
                        lastUserMessage.toLowerCase().includes('bureaucracy') ||
                        lastUserMessage.toLowerCase().includes('tax') ||
                        lastUserMessage.toLowerCase().includes('germany');

    if (needsSearch) {
      console.log(`[Chat Route] Automatically grounding query with Tavily: "${lastUserMessage}"`);
      groundingContext = await searchTavily(lastUserMessage);
    }

    // Convert messages to Gemini history structure.
    // Note: Gemini uses 'user' and 'model' as roles.
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // If we have grounding context, append it to the last user message in the input for Gemini
    if (groundingContext && contents.length > 0) {
      const lastIndex = contents.length - 1;
      if (contents[lastIndex].role === 'user') {
        contents[lastIndex].parts[0].text += `\n\n[Search Grounding Context for Assistant reference (accurate official details):\n${groundingContext}\n]`;
      }
    }

    // Stream from Gemini
    console.log('[Chat Route] Invoking Gemini API stream...');
    const resultStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    for await (const chunk of resultStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('[Chat Route] Gemini streaming error:', error);
    res.write(`data: ${JSON.stringify({ text: '\n\n*(Error: Gemini connection failed. Defaulting to relocation guide)*\n\n' })}\n\n`);
    streamMockResponse(messages, profile, res);
  }
});

// Helper for simulated stream
function streamMockResponse(messages: Message[], profile: UserProfile, res: any) {
  const lastUserMessage = (messages[messages.length - 1]?.content || '').toLowerCase();
  let text = '';

  const firstName = profile?.firstName || 'there';
  const targetCity = profile?.targetCity || 'Germany';

  if (lastUserMessage.includes('anmeldung') || lastUserMessage.includes('register') || lastUserMessage.includes('address')) {
    text = `### 📍 Address Registration (Anmeldung) in ${targetCity}

To register your address in ${targetCity}, you need to complete the following:

1. **Find an Apartment**: Ensure you get a signed **Wohnungsgeberbestätigung** (landlord confirmation form) from your landlord.
2. **Book an Appointment**: Book an appointment at any *Bürgeramt* (citizen service office) in ${targetCity}.
3. **Prepare Documents**:
   - Passport/ID card.
   - Rental contract (sometimes asked, but landlord confirmation is required).
   - Filled registration form (Anmeldung).
4. **Attend the Appointment**: Go to the Bürgeramt. The process takes 10-15 minutes and is free. You will receive your **Meldebestätigung** (registration certificate) on the spot.

💰 **Premium Feature**: Click **Unlock Relocation Pack** on the right to pay 1 USDC and instantly download your pre-filled official Anmeldung PDF form!`;
  } else if (lastUserMessage.includes('visa') || lastUserMessage.includes('permit') || lastUserMessage.includes('work')) {
    text = `### 🛂 Visa and Residence Permit Guide

For your move as a **${profile?.nationality || 'foreign'} citizen** on a **${profile?.visaStatus || 'employment'} visa**:

1. **Embassy Application**: Apply for your national visa in your country of residence before arrival.
2. **Documents Needed**:
   - Job contract (with minimum salary requirements for the EU Blue Card if applicable).
   - University/Vocational certificate (recognized in Germany).
   - Health insurance certificate.
3. **Ausländerbehörde**: After arriving in Germany and doing your Anmeldung, book an appointment at the Immigration Office (Ausländerbehörde) to convert your visa to a long-term residence permit (Aufenthaltstitel).`;
  } else if (lastUserMessage.includes('insurance') || lastUserMessage.includes('health') || lastUserMessage.includes('krankenkasse')) {
    text = `### 🏥 Health Insurance Requirement

German health insurance is mandatory for all residents.

- **Public Health Insurance (GKV)**: e.g., Techniker Krankenkasse (TK), AOK, Barmer. This is standard for employees (if salary is below €69,300/year). Your employer covers half the cost.
- **Private Health Insurance (PKV)**: Available if you earn over €69,300, are self-employed, or are a student (under specific conditions).
- **Relocation Health Insurance**: Use a certified expat cover (like Feather or Mawista) for the initial visa entry, then swap to permanent public or private insurance.`;
  } else {
    text = `Hello ${firstName}! I am your Relocation AI assistant. 

I can guide you through the transition to **${targetCity}**. Based on your profile, I recommend starting with the following topics:
- **Anmeldung (Address registration)**: The gateway to German bureaucracy.
- **Health Insurance**: Compulsory for getting your visa or residence permit.
- **Visa & Work Permits**: For citizens of ${profile?.nationality || 'non-EU countries'}.

How can I help you today? You can ask details about any of these steps, or click the **Simulate 1 USDC Payment** to unlock the filled forms!`;
  }

  // Stream word by word
  const words = text.split(' ');
  let idx = 0;

  function sendNextWord() {
    if (idx < words.length) {
      const chunk = words[idx] + ' ';
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      idx++;
      setTimeout(sendNextWord, 50); // Send next word in 50ms
    } else {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  sendNextWord();
}
