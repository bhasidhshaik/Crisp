import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error: Missing API Key." });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Generate a set of 6 interview questions for a Full Stack (React/Node.js) developer role.
            The questions must be structured as follows: 2 easy, 2 medium, and 2 hard.
            Return ONLY a valid JSON array of objects in the format: [{"question": "...", "difficulty": "Easy", "time": 20}, ...].
            The 'time' property must be exactly 20 for Easy, 60 for Medium, and 120 for Hard questions.
            Do not include any other text, formatting, or markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        const questions = JSON.parse(text);

        if (!Array.isArray(questions) || questions.length !== 6) {
            throw new Error('AI did not return the expected format.');
        }

        return res.status(200).json({ questions });

    } catch (err) {
        console.error("Error generating questions:", err);
        return res.status(500).json({ error: 'Failed to generate interview questions.' });
    }
}