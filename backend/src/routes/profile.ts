import { Router } from 'express';

export const profileRouter = Router();

export interface UserProfile {
  firstName: string;
  lastName: string;
  birthdate: string;
  nationality: string;
  targetCity: string;
  visaStatus: string;
  relocationDate: string;
}

export interface SubStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
  subSteps: SubStep[];
}

profileRouter.post('/api/profile', (req, res) => {
  const profile: UserProfile = req.body;

  if (!profile.firstName || !profile.nationality) {
    return res.status(400).json({ error: 'Missing required profile fields (firstName, nationality)' });
  }

  const steps: ChecklistItem[] = [];

  // Step 1: Visa / Entry Requirements
  const nationalityLower = profile.nationality.trim().toLowerCase();
  const euCountries = [
    'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic', 'denmark', 
    'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland', 'italy', 
    'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands', 'poland', 'portugal', 
    'romania', 'slovakia', 'slovenia', 'spain', 'sweden', 'switzerland', 'norway', 'iceland', 'liechtenstein'
  ];
  
  const isEU = euCountries.includes(nationalityLower);
  
  if (isEU) {
    steps.push({
      id: 'visa',
      title: 'EU Freedom of Movement (No Visa)',
      description: 'As an EU/EEA or Swiss citizen, you do not need a visa to enter, live, or work in Germany. Just travel with your national ID card or passport.',
      priority: 'high',
      completed: false,
      subSteps: [
        { id: 'visa_1', title: 'Bring a valid passport or national ID card', completed: false },
        { id: 'visa_2', title: 'Confirm employment/study readiness (no permission needed)', completed: true }
      ]
    });
  } else {
    steps.push({
      id: 'visa',
      title: `Apply for ${profile.visaStatus || 'Employment'} Visa`,
      description: `Since you are a citizen of ${profile.nationality}, you must apply for a visa at the German Embassy/Consulate in your country of residence before your arrival.`,
      priority: 'high',
      completed: false,
      subSteps: [
        { id: 'visa_1', title: 'Book an appointment at the German Consulate', completed: false },
        { id: 'visa_2', title: 'Gather required documents (job contract, degree recognition, qualifications)', completed: false },
        { id: 'visa_3', title: 'Submit national visa application (D-Visa) and passport', completed: false }
      ]
    });
  }

  // Step 2: Health Insurance
  steps.push({
    id: 'health_insurance',
    title: 'Secure Health Insurance',
    description: 'Health insurance is legally mandatory in Germany. You will need proof of GKV (public) or GKV-equivalent PKV (private) health insurance.',
    priority: 'high',
    completed: false,
    subSteps: [
      { id: 'health_1', title: 'Compare public providers (e.g., TK, AOK, Barmer)', completed: false },
      { id: 'health_2', title: 'Apply for membership online (e.g., via digital expat service)', completed: false },
      { id: 'health_3', title: 'Obtain insurance certificate (Mitgliedsbescheinigung) for visa/employer', completed: false }
    ]
  });

  // Step 3: Temporary Housing
  steps.push({
    id: 'temporary_housing',
    title: 'Book Anmeldung-Eligible Housing',
    description: 'Ensure your landlord or host can provide a Wohnungsgeberbestätigung (landlord confirmation). You cannot register your address without this document.',
    priority: 'high',
    completed: false,
    subSteps: [
      { id: 'housing_1', title: 'Search for apartments that explicitly offer "Anmeldung allowed"', completed: false },
      { id: 'housing_2', title: 'Sign tenancy agreement and pay deposit', completed: false },
      { id: 'housing_3', title: 'Get signed Wohnungsgeberbestätigung from the landlord', completed: false }
    ]
  });

  // Step 4: Anmeldung (Address Registration)
  steps.push({
    id: 'anmeldung',
    title: 'Register Address (Anmeldung)',
    description: `Book a Bürgeramt appointment in ${profile.targetCity || 'Germany'} to register your address within 14 days of moving in.`,
    priority: 'high',
    completed: false,
    subSteps: [
      { id: 'anmeldung_1', title: 'Book a Bürgeramt appointment online or call 115', completed: false },
      { id: 'anmeldung_2', title: 'Fill out the official address registration form (Meldeschein)', completed: false },
      { id: 'anmeldung_3', title: 'Attend the appointment with landlord letter and passport to get your Meldebestätigung', completed: false }
    ]
  });

  // Step 5: Tax ID
  steps.push({
    id: 'tax_id',
    title: 'Obtain Tax ID (Steueridentifikationsnummer)',
    description: 'After completing your Anmeldung, the Federal Tax Office (BZSt) will automatically mail your Tax ID to your registered address.',
    priority: 'medium',
    completed: false,
    subSteps: [
      { id: 'tax_1', title: 'Ensure your last name is clearly labeled on your apartment mailbox', completed: false },
      { id: 'tax_2', title: 'Wait 2-4 weeks for the official BZSt letter to arrive in the mail', completed: false }
    ]
  });

  // Step 6: Bank Account
  steps.push({
    id: 'bank_account',
    title: 'Open a German Bank Account',
    description: 'Open a local German bank account or SEPA-compatible account for utility payments, rent transfers, and receiving wages.',
    priority: 'medium',
    completed: false,
    subSteps: [
      { id: 'bank_1', title: 'Select a SEPA-compatible bank (e.g., N26, Revolut, Sparkasse)', completed: false },
      { id: 'bank_2', title: 'Verify identity online using VideoIdent or PostIdent', completed: false },
      { id: 'bank_3', title: 'Activate the account and transfer initial funds', completed: false }
    ]
  });

  res.json({
    profile,
    steps,
    recommendations: {
      summary: `Welcome to Germany, ${profile.firstName}! Based on your profile, we have outlined the 6 critical steps for your relocation to ${profile.targetCity || 'Germany'}.`,
      tips: [
        'Bürgeramt appointments can be hard to get. Check the website daily at 8:00 AM when cancellations are released, or call 115 (the local citizen service phone number).',
        'Germany runs on paper. Create a physical binder to store all your registrations, contracts, and letters.',
        'Make sure to put your last name on your apartment mailbox as soon as you move in. Official mail like your Tax ID will not be delivered otherwise.'
      ]
    }
  });
});
