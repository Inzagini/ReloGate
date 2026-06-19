"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
exports.profileRouter = (0, express_1.Router)();
exports.profileRouter.post('/api/profile', (req, res) => {
    const profile = req.body;
    if (!profile.firstName || !profile.nationality) {
        return res.status(400).json({ error: 'Missing required profile fields (firstName, nationality)' });
    }
    const steps = [];
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
            title: 'EU Freedom of Movement (No Visa Required)',
            description: 'As an EU/EEA or Swiss citizen, you do not need a visa to enter, live, or work in Germany. Just travel with your national ID card or passport.',
            priority: 'high',
            completed: false
        });
    }
    else {
        steps.push({
            id: 'visa',
            title: `Apply for ${profile.visaStatus || 'Employment'} Visa`,
            description: `Since you are a citizen of ${profile.nationality}, you must apply for a visa at the German Embassy/Consulate in your country of residence before your arrival.`,
            priority: 'high',
            completed: false
        });
    }
    // Step 2: Health Insurance
    steps.push({
        id: 'health_insurance',
        title: 'Secure Health Insurance',
        description: 'Health insurance is legally mandatory. You will need proof of public (GKV) or qualifying private (PKV) health insurance for your visa and address registration.',
        priority: 'high',
        completed: false
    });
    // Step 3: Temporary Housing
    steps.push({
        id: 'temporary_housing',
        title: 'Book Temporary Housing with Anmeldung eligibility',
        description: 'Ensure your landlord or host can provide a Wohnungsgeberbestätigung (landlord confirmation). You cannot register your address without this document.',
        priority: 'high',
        completed: false
    });
    // Step 4: Anmeldung (Address Registration)
    steps.push({
        id: 'anmeldung',
        title: 'Register Address (Anmeldung)',
        description: `Book a Bürgeramt appointment in ${profile.targetCity || 'Germany'} to register your apartment address within 14 days of moving in.`,
        priority: 'high',
        completed: false
    });
    // Step 5: Tax ID
    steps.push({
        id: 'tax_id',
        title: 'Obtain Tax ID (Steueridentifikationsnummer)',
        description: 'After completing your Anmeldung, the Federal Tax Office (BZSt) will automatically mail your Tax ID to your registered address in 2 to 4 weeks.',
        priority: 'medium',
        completed: false
    });
    // Step 6: Bank Account
    steps.push({
        id: 'bank_account',
        title: 'Open a German Bank Account',
        description: 'Open a local German bank account or SEPA-compatible account (e.g. N26, Revolut, Sparkasse) for utility payments, rent transfers, and receiving wages.',
        priority: 'medium',
        completed: false
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
