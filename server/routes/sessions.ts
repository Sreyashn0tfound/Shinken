import { Router } from 'express';
import { db } from '../db.js';
// 🚨 ADDED answers and questions to the imports!
import { sessions, clans, players, quizzes, answers, questions } from '../../src/db/schema.js'; 
import { eq, desc } from 'drizzle-orm';

export const sessionRouter = Router();

// --- 0. INITIALIZE TOURNAMENT ---
sessionRouter.post('/initialize', async (req, res) => {
    try {
        const { hostId, mode, issueCertificates, certificateBase64, quizId } = req.body;

        let activeQuizId = quizId || 1;
        const existingQuiz = await db.select().from(quizzes).where(eq(quizzes.id, activeQuizId));
        
        if (!existingQuiz.length) {
            const newQuiz = await db.insert(quizzes).values({
                teacherId: hostId,
                title: "SHINKEN: Master Vault"
            }).returning();
            activeQuizId = newQuiz[0].id;
        }

        const pin = Math.floor(1000 + Math.random() * 9000).toString(); 

        const newSession = await db.insert(sessions).values({
            hostId,
            quizId: activeQuizId,
            pin,
            mode,
            issueCertificates,
            certificateBase64: issueCertificates ? certificateBase64 : null,
            status: 'waiting_in_lobby'
        }).returning();

        res.json({ success: true, session: newSession[0] });
    } catch (error) {
        console.error("Initialization Error:", error);
        res.status(500).json({ error: "Failed to initialize the arena." });
    }
});

// 🚨 THE MISSING FIX: VERIFY THE PIN 🚨
sessionRouter.get('/verify/:pin', async (req, res) => {
    try {
        const { pin } = req.params;
        const activeSession = await db.select().from(sessions).where(eq(sessions.pin, pin));
        
        if (!activeSession.length) {
            return res.status(404).json({ error: "Invalid or inactive Session PIN." });
        }
        
        res.json({ success: true, session: activeSession[0] });
    } catch (error) {
        res.status(500).json({ error: "Failed to verify PIN." });
    }
});

// --- 1. START THE TRIALS ---
sessionRouter.post('/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        const startTime = new Date();

        await db.update(sessions)
            .set({ status: 'active', startTime })
            .where(eq(sessions.id, parseInt(id)));

        res.json({ success: true, startTime });
    } catch (error) {
        res.status(500).json({ error: "Failed to commence trials." });
    }
});

// --- 2. THE EMERGENCY KILL SWITCH ---
sessionRouter.post('/:id/reset', async (req, res) => {
    try {
        const { id } = req.params;

        await db.update(sessions)
            .set({ status: 'waiting_in_lobby', startTime: null })
            .where(eq(sessions.id, parseInt(id)));

        // Reset all strikes for this session
        const sessionClans = await db.select().from(clans).where(eq(clans.sessionId, parseInt(id)));
        for (const clan of sessionClans) {
            await db.update(players).set({ strikes: 0 }).where(eq(players.clanId, clan.id));
        }

        res.json({ success: true, message: "Arena reset." });
    } catch (error) {
        res.status(500).json({ error: "Kill switch failed." });
    }
});

// --- 3. TEACHER DASHBOARD RADAR ---
sessionRouter.get('/:hostId/dashboard', async (req, res) => {
    try {
        const { hostId } = req.params;
        
        const activeSessions = await db.select().from(sessions)
            .where(eq(sessions.hostId, hostId))
            .orderBy(desc(sessions.id))
            .limit(1);

        if (!activeSessions.length) {
            return res.json({ session: null, clans: [], players: [] });
        }

        const session = activeSessions[0];
        const activeClans = await db.select().from(clans).where(eq(clans.sessionId, session.id));
        const activePlayers = await db.select().from(players); 

        // 🚨 FETCH LIVE ANSWERS & QUESTIONS FOR REAL SCORING
        const sessionAnswers = await db.select().from(answers).where(eq(answers.sessionId, session.id));
        const sessionQuestions = await db.select().from(questions).where(eq(questions.quizId, session.quizId));

        res.json({ 
            session, 
            clans: activeClans, 
            players: activePlayers, 
            answers: sessionAnswers, 
            questions: sessionQuestions 
        });
    } catch (error) {
        console.error("Radar Error:", error);
        res.status(500).json({ error: "Radar offline." });
    }
});

// 🚨 THE MISSING FIX: GATE LOCKS 🚨
sessionRouter.post('/:id/lock1', async (req, res) => {
    try {
        await db.update(sessions).set({ status: 'gate_1_complete', startTime: null }).where(eq(sessions.id, parseInt(req.params.id)));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Failed to lock Gate 1" }); }
});

sessionRouter.post('/:id/start2', async (req, res) => {
    try {
        const { survivingClanIds } = req.body;
        await db.update(sessions).set({ status: 'active_gate_2', startTime: new Date() }).where(eq(sessions.id, parseInt(req.params.id)));
        
        const allClans = await db.select().from(clans).where(eq(clans.sessionId, parseInt(req.params.id)));
        for (const c of allClans) {
            if (!survivingClanIds.includes(c.id)) {
                await db.update(clans).set({ status: 'eliminated' }).where(eq(clans.id, c.id));
            }
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Failed to start Gate 2" }); }
});

sessionRouter.post('/:id/lock2', async (req, res) => {
    try {
        await db.update(sessions).set({ status: 'tournament_complete', startTime: null }).where(eq(sessions.id, parseInt(req.params.id)));
        await db.update(clans).set({ status: 'tournament_complete' }).where(eq(clans.sessionId, parseInt(req.params.id)));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Failed to complete tournament" }); }
});