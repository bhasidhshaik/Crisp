import { IncomingForm } from 'formidable';
import pdf from 'pdf-parse';
import fs from 'fs/promises';

// Vercel config to allow file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const form = new IncomingForm();
        const [fields, files] = await form.parse(req);
        
        const resumeFile = files.resume?.[0];

        if (!resumeFile) {
            return res.status(400).json({ error: 'No resume file found.' });
        }

        const fileBuffer = await fs.readFile(resumeFile.filepath);
        const pdfData = await pdf(fileBuffer);

        // Success! Send back the extracted text.
        res.status(200).json({ text: pdfData.text });

    } catch (error) {
        console.error("Error extracting text:", error);
        res.status(500).json({ error: 'Failed to extract text from PDF.' });
    }
}
