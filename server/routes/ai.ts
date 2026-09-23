import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { db } from '../db.js';
import { quizzes, questions } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const aiRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI(); // Requires process.env.OPENAI_API_KEY

// ---------------------------------------------------------------------------
// POST /api/ai/parse
// Accepts a PDF upload and uses OpenAI to convert it into a structured quiz.
// ---------------------------------------------------------------------------
aiRouter.post('/parse', upload.single('pdf'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF uploaded." });
        }
        
        // Parse PDF text
        const pdfData = await pdfParse(req.file.buffer);
        const text = pdfData.text;

        const prompt = `Convert the following text into a structured JSON quiz.
Format exactly as this JSON structure (an object with a 'sections' array):
{
  "sections": [
    {
      "sectionTitle": "string",
      "questions": [
        {
          "questionText": "string",
          "options": ["string"], // exactly 4 options
          "correctAnswer": "string" // exactly matches one of the options
        }
      ]
    }
  ]
}

Text to parse:
${text.slice(0, 15000)} // Taking up to 15k characters to keep it reasonable
`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: "You are a precise educational assistant that converts documents into multiple-choice quizzes. Return JSON exactly." },
                { role: "user", content: prompt }
            ]
        });

        const resultStr = completion.choices[0].message?.content;
        const result = JSON.parse(resultStr || '{"sections": []}');
        
        // Return sections to frontend so it can render and save them
        res.json({ sections: result.sections, existingQuizId: null });
    } catch (error: any) {
        console.error('Parse Error:', error);
        res.status(500).json({ error: error.message || 'Failed to parse PDF and generate quiz.' });
    }
});
