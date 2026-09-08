import { Router, type Request, type Response } from 'express';
import { db } from '../db.js';
import { quizzes, questions } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const aiRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/ai/parse
// Accepts a PDF upload (gimmick only — file is ignored).
// Fetches the pre-seeded quiz from the DB and returns questions WITHOUT
// correct answers (so they stay server-side only).
// ---------------------------------------------------------------------------
aiRouter.post('/parse', async (_req: Request, res: Response) => {
    try {
        // Find the system-seeded quiz
        const seededQuiz = await db.select().from(quizzes)
            .where(eq(quizzes.teacherId, 'system'))
            .limit(1);

        if (!seededQuiz.length) {
            return res.status(404).json({
                error: "No exam found in the vault. Run: npx tsx server/seed.ts"
            });
        }

        const quiz = seededQuiz[0];
        const dbQuestions = await db.select().from(questions)
            .where(eq(questions.quizId, quiz.id));

        // Group by sectionTitle
        const sectionMap = new Map<string, typeof dbQuestions>();
        for (const q of dbQuestions) {
            const sec = q.sectionTitle || 'General';
            if (!sectionMap.has(sec)) sectionMap.set(sec, []);
            sectionMap.get(sec)!.push(q);
        }

        const sections = Array.from(sectionMap.entries()).map(([title, qs]) => ({
            sectionTitle: title,
            questions: qs.map(q => ({
                questionText: q.text,
                options: q.options as string[],
                // correctAnswer intentionally omitted from response
            }))
        }));

        // Return the quizId so ExamForge can skip re-inserting questions
        res.json({ sections, existingQuizId: quiz.id });
    } catch (error: any) {
        console.error('Parse Error:', error);
        res.status(500).json({ error: error.message || 'Failed to load exam from vault.' });
    }
});
