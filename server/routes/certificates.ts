import { Router } from 'express';
import { db } from '../db.js'; // Your Drizzle connection
import { clans, players, sessions } from '../../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export const certificateRouter = Router();

certificateRouter.post('/generate/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionIdNum = parseInt(sessionId);

        // 1. Verify the session allows certificates
        const sessionData = await db.select().from(sessions).where(eq(sessions.id, sessionIdNum));
        if (!sessionData[0]?.issueCertificates) {
            return res.status(400).json({ error: "Certificates are disabled for this event." });
        }

        const templateUrl = sessionData[0].certificateBase64;

        // 2. Fetch and rank the clans by totalScore (Highest to Lowest)
        const rankedClans = await db.select()
            .from(clans)
            .where(eq(clans.sessionId, sessionIdNum))
            .orderBy(desc(clans.totalScore));

        // 3. Fetch all players in this session
        const allPlayers = await db.select()
            .from(players)
            .innerJoin(clans, eq(players.clanId, clans.id))
            .where(eq(clans.sessionId, sessionIdNum));

        // 4. Generate the payload for the frontend
        const certificates = allPlayers.map(({ players: player, clans: clan }) => {
            // Find the clan's exact rank (index + 1)
            const rankIndex = rankedClans.findIndex(c => c.id === clan.id);
            const rank = rankIndex + 1;

            let awardText = "Participant";
            let ribbonColor = "#333333"; // Default Gray

            if (rank === 1) { awardText = "1st Place Champion"; ribbonColor = "#FFD700"; } // Gold
            else if (rank === 2) { awardText = "2nd Place"; ribbonColor = "#C0C0C0"; } // Silver
            else if (rank === 3) { awardText = "3rd Place"; ribbonColor = "#CD7F32"; } // Bronze

            return {
                playerId: player.id,
                name: player.name,
                clan: clan.name,
                score: clan.totalScore,
                rank: awardText,
                ribbonColor,
                template: templateUrl,
                // In a full implementation, you would use pdf-lib here to inject 
                // these variables directly into the template and return a base64 string
            };
        });

        res.json({ success: true, certificates });

    } catch (error) {
        console.error("Certificate Generation Error:", error);
        res.status(500).json({ error: "Failed to forge certificates." });
    }
});