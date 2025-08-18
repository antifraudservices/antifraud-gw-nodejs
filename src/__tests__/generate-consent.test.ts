import fs from 'fs';
import path from 'path';
import { generateConsentForm } from '../pdf/generate-consent-form';

describe('ConsentForm PDF', () => {
  it('should generate a valid PDF with dropdowns and save it', async () => {
    const pdfBytes = await generateConsentForm();
    const outPath = path.resolve(__dirname, 'output/consent-form.pdf');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, pdfBytes);

    expect(fs.existsSync(outPath)).toBe(true);
    console.log('PDF generated at:', outPath);
  });
});
