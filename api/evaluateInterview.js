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
        const { questions, answers } = req.body;

        if (!questions || !answers || questions.length !== answers.length) {
            return res.status(400).json({ error: 'Invalid interview data provided.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const transcript = questions.map((q, i) => `Question: ${q.question}\nAnswer: ${answers[i] || "No answer provided."}`).join('\n\n');

        const prompt = `
            You are an expert technical interviewer for a Full Stack (React/Node.js) developer role.
            Analyze the following interview transcript.
            Provide a final score out of 100, considering the correctness, clarity, and depth of the answers.
            Then, write a concise 3-4 sentence summary of the candidate's performance, highlighting their strengths and weaknesses.
            Return ONLY a valid JSON object in the format: {"score": ..., "summary": "..."}.
            Do not include any other text, formatting, or markdown.
            
            Transcript:
            ---
            ${transcript}
            ---
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const evaluation = JSON.parse(text);

        return res.status(200).json(evaluation);

    } catch (err) {
        console.error("Error evaluating interview:", err);
        return res.status(500).json({ error: 'Failed to evaluate interview.' });
    }
}