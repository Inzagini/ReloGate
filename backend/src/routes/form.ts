import { Router } from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const formRouter = Router();

interface UserProfile {
  firstName: string;
  lastName: string;
  birthdate: string;
  nationality: string;
  targetCity: string;
  visaStatus: string;
  relocationDate: string;
}

formRouter.post('/api/form/fill', async (req, res) => {
  const { paymentToken, profile } = req.body as { paymentToken: string; profile: UserProfile };

  if (!paymentToken) {
    return res.status(401).json({ error: 'Missing paymentToken. Form generation locked.' });
  }

  if (!profile) {
    return res.status(400).json({ error: 'Missing user profile data.' });
  }

  try {
    console.log(`[Form Router] Generating PDF form for ${profile.firstName} ${profile.lastName}`);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 Dimensions in points
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const drawHeader = () => {
      // Background Accent bar
      page.drawRectangle({
        x: 0,
        y: 790,
        width: 595.28,
        height: 52,
        color: rgb(0.11, 0.16, 0.29), // #1c294a Dark blue
      });

      page.drawText('GERMAN ADDRESS REGISTRATION (ANMELDUNG)', {
        x: 40,
        y: 810,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText('PRE-FILLED ADMINISTRATIVE FORM DRAFT (USDC Commerce Unlocked)', {
        x: 40,
        y: 798,
        size: 8,
        font: font,
        color: rgb(0.8, 0.8, 0.8),
      });
    };

    drawHeader();

    let yPos = 740;
    const writeSectionTitle = (title: string) => {
      page.drawRectangle({
        x: 40,
        y: yPos - 5,
        width: 515.28,
        height: 20,
        color: rgb(0.9, 0.93, 0.96),
      });
      page.drawText(title, {
        x: 48,
        y: yPos,
        size: 11,
        font: fontBold,
        color: rgb(0.2, 0.25, 0.35),
      });
      yPos -= 35;
    };

    const writeField = (label: string, value: string) => {
      page.drawText(label, {
        x: 48,
        y: yPos,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      page.drawText(value || 'N/A', {
        x: 220,
        y: yPos,
        size: 10,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });
      
      // Draw underline for fields
      page.drawLine({
        start: { x: 215, y: yPos - 3 },
        end: { x: 540, y: yPos - 3 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      yPos -= 25;
    };

    // 1. Personal Information
    writeSectionTitle('1. PERSONAL DETAILS (Angaben zur Person)');
    writeField('First Name (Vorname):', profile.firstName);
    writeField('Last Name (Familienname):', profile.lastName);
    writeField('Date of Birth (Geburtsdatum):', profile.birthdate);
    writeField('Nationality (Staatsangehörigkeit):', profile.nationality);
    
    yPos -= 15;

    // 2. Relocation Context
    writeSectionTitle('2. RELOCATION DETAILS (Angaben zum Einzug)');
    writeField('Target City (Zielstadt):', profile.targetCity);
    writeField('Visa Status (Aufenthaltsstatus):', profile.visaStatus);
    writeField('Moving Date (Einzugsdatum):', profile.relocationDate);
    writeField('Payment Token (Freigabeschlüssel):', paymentToken);

    yPos -= 15;

    // 3. Official Requirements Notice
    writeSectionTitle('3. NEXT OFFICIAL STEPS (Nächste Schritte)');
    
    const instructions = [
      '1. Print this draft along with the official Bürgeramt form.',
      '2. Gather your passport, visa/residence permit, and landlord confirmation.',
      '3. Attend your scheduled appointment at the Bürgeramt in your city.',
      '4. Obtain your Meldebestätigung. Your tax ID will follow in 2-4 weeks.',
    ];

    for (const inst of instructions) {
      page.drawText(inst, {
        x: 48,
        y: yPos,
        size: 9.5,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPos -= 20;
    }

    // Footer info
    page.drawText('Disclaimer: This is a generated document draft based on user input. Always verify details with official Bürgeramt resources.', {
      x: 40,
      y: 50,
      size: 7,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Anmeldung_${profile.firstName}_${profile.lastName}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('[Form Router] Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF document.' });
  }
});
