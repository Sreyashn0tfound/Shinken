import { Router } from 'express';
import { db } from '../db.ts';
import { questions, quizzes } from '../../src/db/schema.ts'; // 🚨 Added quizzes
import { eq } from 'drizzle-orm';

export const questionRouter = Router();

// --- 1. INJECT A SINGLE NEW QUESTION (MANUAL) ---
questionRouter.post('/forge', async (req, res) => {
    try {
        const { quizId, title, text, options, correctAnswer } = req.body;
        
        const newQuestion = await db.insert(questions).values({
            quizId,
            title,
            text,
            options,
            correctAnswer
        }).returning();

        res.json({ success: true, question: newQuestion[0] });
    } catch (error) {
        console.error("Forge Error:", error);
        res.status(500).json({ error: "Failed to forge weapon." });
    }
});

// --- 2. BULK INSERT AI EXAM (GEMINI) ---
questionRouter.post('/ai-forge', async (req, res) => {
    try {
        const { teacherId, title, sections } = req.body;

        // 1. Forge the Master Quiz Record
        const newQuiz = await db.insert(quizzes).values({
            teacherId,
            title
        }).returning();
        
        const activeQuizId = newQuiz[0].id;

        // 2. Flatten the nested AI sections into a flat array for Drizzle
        const questionsToInsert = [];
        for (const section of sections) {
            for (const q of section.questions) {
                questionsToInsert.push({
                    quizId: activeQuizId,
                    sectionTitle: section.sectionTitle,
                    title: "AI Generated", // Fallback title
                    text: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                });
            }
        }

        // 3. Bulk Insert the entire arsenal at once
        await db.insert(questions).values(questionsToInsert);

        res.json({ success: true, quizId: activeQuizId });
    } catch (error) {
        console.error("Vault Lock Error:", error);
        res.status(500).json({ error: "Failed to seal the exam in the database." });
    }
});

// --- 3. FETCH QUESTIONS FOR A QUIZ ---
questionRouter.get('/:quizId', async (req, res) => {
    try {
        const { quizId } = req.params;
        const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, parseInt(quizId)));
        
        res.json({ questions: quizQuestions });
    } catch (error) {
        res.status(500).json({ error: "Failed to open the vault." });
    }
});

// --- 4. DELETE A MISTAKE ---
questionRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(questions).where(eq(questions.id, parseInt(id)));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to destroy weapon." });
    }
});