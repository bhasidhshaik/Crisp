import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI client with your API key from environment variables


export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// console.log("GEMINI_API_KEY:", GEMINI_API_KEY);

if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment variables." });
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    try {
        // This function now only receives simple text, no files.
        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({ error: 'No resume text was provided.' });
        }

         const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        
       

// async function listModels() {
//   try {
//     const models = await genAI.listModels();
//     console.log(models);
//   } catch (err) {
//     console.error(err);
//   }
// }

// listModels();


        const prompt = `
            Extract the full name, email address, and phone number from the following resume text.
            Respond ONLY with a valid JSON object in the format: {"name": "...", "email": "...", "phone": "..."}.
            Do not include any other text, formatting, or backticks.
            If a field is not found, its value should be null.

            Resume Text:
            ---
            ${resumeText.substring(0, 8000)} 
            ---
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // console.log("AI response:", response.text);
        
        const text = response.text();
         const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const resultJson = JSON.parse(cleanedText);

        return res.status(200).json(resultJson);

    } catch (err) {
        console.error("Error in parseResume:", err);
        return res.status(500).json({ error: 'An error occurred during AI parsing.' });
    }
}

