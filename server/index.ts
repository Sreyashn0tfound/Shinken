import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './routes/ai.js';
import { clanRouter } from './routes/clans.js';
import { sessionRouter } from './routes/sessions.js';
import { questionRouter } from './routes/questions.js';
import { certificateRouter } from './routes/certificates.js';
import { quizRouter } from './routes/quizzes.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRouter);
app.use('/api/clans', clanRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/questions', questionRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api/quizzes', quizRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Shogun Command Center is active' });
});

// 🚨 Only start the local server if we aren't in Vercel's production environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`⚔️ Shogun Command Center running on http://localhost:${PORT}`);
    });
}

// 🚨 VERCEL NEEDS THIS EXPORT TO RUN YOUR EXPRESS ROUTES AS SERVERLESS FUNCTIONS
export default app;