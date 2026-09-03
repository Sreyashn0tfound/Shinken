import { Router } from 'express';
import { db } from '../db.js';
import { quizzes } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const quizRouter = Router();

// --- FETCH ALL QUIZZES FOR A SPECIFIC TEACHER ---
quizRouter.get('/teacher/:clerkId', async (req, res) => {
    try {
        const { clerkId } = req.params;
        const teacherQuizzes = await db.select().from(quizzes).where(eq(quizzes.teacherId, clerkId));
        
        res.json({ quizzes: teacherQuizzes });
    } catch (error) {
        console.error("Failed to fetch archives:", error);
        res.status(500).json({ error: "Failed to access the archives." });
    }
});