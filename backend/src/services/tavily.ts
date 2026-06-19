import dotenv from 'dotenv';

dotenv.config();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

export interface TavilyResponse {
  answer?: string;
  results: TavilySearchResult[];
}

/**
 * Searches the web using Tavily API.
 * Falls back to high-fidelity mock results for Germany relocation topics if key is missing or query fails.
 */
export async function searchTavily(query: string): Promise<string> {
  if (!TAVILY_API_KEY || TAVILY_API_KEY.includes('PLACEHOLDER')) {
    console.log(`[Tavily Service] No API key found. Using mock results for query: "${query}"`);
    return getMockResults(query);
  }

  try {
    console.log(`[Tavily Service] Querying Tavily for: "${query}"`);
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'basic',
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API returned status ${response.status}`);
    }

    const data = (await response.json()) as TavilyResponse;
    
    let output = '';
    if (data.answer) {
      output += `Summary Answer: ${data.answer}\n\n`;
    }
    
    output += 'Search Results:\n';
    data.results.forEach((res, idx) => {
      output += `[${idx + 1}] ${res.title}\nURL: ${res.url}\nSnippet: ${res.content}\n\n`;
    });

    return output;
  } catch (error) {
    console.error('[Tavily Service] Error querying Tavily:', error);
    console.log('[Tavily Service] Falling back to mock results.');
    return getMockResults(query);
  }
}

function getMockResults(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('anmeldung') || queryLower.includes('register') || queryLower.includes('address')) {
    return `Summary Answer: To register your address (Anmeldung) in Berlin, you need to book an appointment at a Bürgeramt, bring a filled registration form, a landlord confirmation (Wohnungsgeberbestätigung), and your ID/passport.

Mock Search Results:
[1] Berlin.de - Anmeldung einer Wohnung
URL: https://service.berlin.de/dienstleistung/120686/
Snippet: Registering a flat in Berlin: You must register within 14 days of moving in. You require a landlord certificate (Wohnungsgeberbestätigung), the filled registration form, and identity documents for all family members. There is no fee for address registration.

[2] All About Berlin - Anmeldung: how to register your address in Berlin
URL: https://allaboutberlin.com/guides/anmeldung-berlin
Snippet: The Anmeldung is the process of registering your address with the German government. It is mandatory for anyone staying in Germany for more than 3 months. You need an appointment at a Bürgeramt, which can be hard to get. Tips: look for appointments early in the morning or call 115.

[3] Expatica Germany - Address Registration (Anmeldung)
URL: https://www.expatica.com/de/moving/location/anmeldung-germany-102123/
Snippet: Within two weeks of moving into a new home in Germany, you must register your address. The document you receive (Meldebestätigung) is essential for opening bank accounts, getting tax IDs, and signing up for mobile contracts.`;
  }
  
  if (queryLower.includes('visa') || queryLower.includes('work permit') || queryLower.includes('residence permit')) {
    return `Summary Answer: Non-EU citizens generally need a visa to enter Germany for work or study. Once in Germany, you convert this visa into a Residence Permit (Aufenthaltstitel) at the Foreigners Authority (Ausländerbehörde).

Mock Search Results:
[1] Make it in Germany - The Quick-Check for Visas
URL: https://www.make-it-in-germany.com/en/visa-residence/quick-check
Snippet: Determine if you need a visa to work or study in Germany. EU citizens enjoy freedom of movement. Citizens of USA, Canada, Australia, Japan, Israel, and South Korea can enter visa-free but must apply for a residence permit within 90 days.

[2] Auswärtiges Amt - Visa regulations for Germany
URL: https://www.auswaertiges-amt.de/en/visa-service/visabestimmungen-node
Snippet: Standard national visa (Category D) is required for long-term stays (more than 90 days) such as working, studying, or family reunification. You must apply at the German consulate in your home country.

[3] Handshake Germany - How to get a Work Visa for Germany
URL: https://handshake-germany.com/work-visa-guide
Snippet: Requirements for a German work visa include: a concrete job offer, a contract with a German employer, and recognized qualifications (university degree or vocational training). For high earners, the EU Blue Card offers a faster track and relaxed requirements.`;
  }

  if (queryLower.includes('insurance') || queryLower.includes('health') || queryLower.includes('krankenkasse')) {
    return `Summary Answer: Health insurance is legally required for everyone in Germany. You can choose between public health insurance (GKV) if your income is below the threshold, and private health insurance (PKV) if you are self-employed, a student, or high-income.

Mock Search Results:
[1] German Federal Ministry of Health - Health Insurance in Germany
URL: https://www.bundesgesundheitsministerium.de/en/health-insurance.html
Snippet: Detailed overview of the dual public-private insurance system in Germany. Public health insurance covers roughly 90% of the population, with premiums based on income.

[2] Feather Insurance - Guide to German Health Insurance
URL: https://feather-insurance.com/guides/health-insurance-germany/
Snippet: Explains differences between public insurance (e.g. TK, AOK, Barmer) and private options. Expatriates can also use temporary expat health insurance for initial visa entry, but must transition to permanent GKV/PKV once employed.`;
  }

  // General default fallback
  return `Summary Answer: Relocating to Germany involves completing address registration (Anmeldung), registering for health insurance, obtaining a tax ID, and optionally acquiring a visa or residence permit.

Mock Search Results:
[1] How to Germany - Relocation Checklist
URL: https://www.howtogermany.com/pages/checklist.html
Snippet: Comprehensive checklist for moving to Germany: applying for visa, booking temporary housing, registering address, setting up health insurance, opening bank account, and getting tax ID.

[2] Simple Germany - Step-by-Step Relocation to Germany
URL: https://www.simplegermany.com/moving-to-germany/
Snippet: A complete guide covering the chronology of moving to Germany. Address registration is key because it unlocks your Tax ID and allows you to sign contracts for internet, gym, and utilities.`;
}
