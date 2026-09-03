import { Router } from 'express';
import { db } from '../db.js';
import { clans, players, sessions, answers } from '../../src/db/schema.js';
import { eq, and, count } from 'drizzle-orm';

export const clanRouter = Router();

// --- 1. THE FORGE (Create Clan) ---
clanRouter.post('/forge', async (req, res) => {
    try {
        // 🚨 ADDED USN
        const { sessionPin, clerkId, playerName, usn, clanName } = req.body;
        const session = await db.select().from(sessions).where(eq(sessions.pin, sessionPin));
        if (!session.length) return res.status(404).json({ error: "Invalid Session PIN." });

        const newClan = await db.insert(clans).values({
            sessionId: session[0].id,
            name: clanName,
        }).returning();

        const newPlayer = await db.insert(players).values({
            clerkId,
            clanId: newClan[0].id,
            name: playerName,
            usn, // 🚨 SAVING USN TO DATABASE
            role: 'captain'
        }).returning();

        res.json({ clan: newClan[0], player: newPlayer[0] });
    } catch (error) { res.status(500).json({ error: "Failed to forge clan." }); }
});

// --- 2. THE RECRUITMENT (Join Clan) ---
clanRouter.post('/join', async (req, res) => {
    try {
        // 🚨 ADDED USN
        const { clanId, clerkId, playerName, usn } = req.body;
        const roster = await db.select({ count: count() }).from(players).where(eq(players.clanId, clanId));
        if (roster[0].count >= 4) return res.status(400).json({ error: "Clan roster is full (Max 4)." });

        const newPlayer = await db.insert(players).values({
            clerkId, 
            clanId, 
            name: playerName, 
            usn, // 🚨 SAVING USN TO DATABASE
            role: 'member'
        }).returning();

        res.json({ player: newPlayer[0] });
    } catch (error) { res.status(500).json({ error: "Failed to join clan." }); }
});

// --- 3. JOIN SOLO MODE ---
clanRouter.post('/solo', async (req, res) => {
    try {
        // 🚨 ADDED USN
        const { sessionPin, clerkId, playerName, usn } = req.body;
        const session = await db.select().from(sessions).where(eq(sessions.pin, sessionPin));
        if (!session.length) return res.status(404).json({ error: "Invalid Session PIN." });

        const newClan = await db.insert(clans).values({
            sessionId: session[0].id,
            name: playerName + "'s Clan",
        }).returning();

        const newPlayer = await db.insert(players).values({
            clerkId, 
            clanId: newClan[0].id, 
            name: playerName, 
            usn, // 🚨 SAVING USN TO DATABASE
            role: 'captain'
        }).returning();

        res.json({ clan: newClan[0], player: newPlayer[0] });
    } catch (error) { res.status(500).json({ error: "Failed to join solo." }); }
});

// --- 4. LOBBY RADAR ---
clanRouter.get('/lobby/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const playerRes = await db.select().from(players).where(eq(players.id, parseInt(playerId)));
        if (!playerRes.length) return res.status(404).json({ error: "Player not found" });

        const player = playerRes[0];
        
        // Safely handle if the player isn't in a clan yet
        if (!player.clanId) return res.status(400).json({ error: "Player is not in a clan." });

        // Safely pass player.clanId because we just verified it exists
        const clanRes = await db.select().from(clans).where(eq(clans.id, player.clanId));
        const sessionRes = await db.select().from(sessions).where(eq(sessions.id, clanRes[0].sessionId));
        const roster = await db.select().from(players).where(eq(players.clanId, clanRes[0].id));
        
        const clanAnswers = await db.select().from(answers).where(eq(answers.sessionId, sessionRes[0].id));
        const clanData = { ...clanRes[0], answers: clanAnswers.filter(a => roster.some(p => p.id === a.playerId)) };

        res.json({ clan: clanData, players: roster, session: sessionRes[0] });
    } catch (error) { res.status(500).json({ error: "Failed to fetch lobby" }); }
});

// --- 5. THE BLIND VAULT (Submit Answer) ---
clanRouter.post('/submit-answer', async (req, res) => {
    try {
        const { playerId, questionId, sessionId, answer, timeSpent } = req.body;
        const existing = await db.select().from(answers).where(and(eq(answers.playerId, playerId), eq(answers.questionId, questionId)));

        if (existing.length) {
            await db.update(answers).set({ answer, timeSpent }).where(eq(answers.id, existing[0].id));
        } else {
            await db.insert(answers).values({ playerId, questionId, sessionId, answer, timeSpent });
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Vault sealed. Failed to submit." }); }
});

// --- 6. LOG ANTI-CHEAT STRIKES ---
clanRouter.post('/strike', async (req, res) => {
    try {
        const { playerId } = req.body;
        const playerRes = await db.select().from(players).where(eq(players.id, playerId));
        if (!playerRes.length) return res.status(404).json({ error: "Player not found" });

        // Null check for strikes using OR operator
        const currentStrikes = playerRes[0].strikes || 0;

        await db.update(players).set({ strikes: currentStrikes + 1 }).where(eq(players.id, playerId));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Failed to log strike" }); }
});