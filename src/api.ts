// src/api.ts

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";

export const shogunApi = {
    // --- CLANS & PLAYERS ---
    forgeClan: async (payload) => {
        const res = await fetch(`${API_URL}/clans/forge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    
    joinClan: async (payload) => {
        const res = await fetch(`${API_URL}/clans/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    joinSolo: async (payload) => {
        const res = await fetch(`${API_URL}/clans/solo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getMyLobby: async (playerId) => {
        const res = await fetch(`${API_URL}/clans/lobby/${playerId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    submitAnswer: async (payload) => {
        const res = await fetch(`${API_URL}/clans/submit-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Vault sealed");
        return res.json();
    },
    
    logStrike: async (payload) => {
        const res = await fetch(`${API_URL}/clans/strike`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to log strike");
        return res.json();
    },

    // --- SESSIONS (TEACHER) ---
    verifySession: async (pin) => {
        const res = await fetch(`${API_URL}/sessions/verify/${pin}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getDashboard: async (hostId) => {
        const res = await fetch(`${API_URL}/sessions/${hostId}/dashboard`);
        if (!res.ok) throw new Error("Failed to fetch radar");
        return res.json();
    },

    initializeSession: async (payload) => {
        const res = await fetch(`${API_URL}/sessions/initialize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to initialize");
        return res.json();
    },

    startTrials: async (sessionId) => {
        const res = await fetch(`${API_URL}/sessions/${sessionId}/start`, { method: "POST" });
        return res.json();
    },

    resetTrials: async (sessionId) => {
        const res = await fetch(`${API_URL}/sessions/${sessionId}/reset`, { method: "POST" });
        return res.json();
    },

    lockGate1: async (sessionId) => {
        const res = await fetch(`${API_URL}/sessions/${sessionId}/lock1`, { method: "POST" });
        return res.json();
    },

    startGate2: async (sessionId, payload) => {
        const res = await fetch(`${API_URL}/sessions/${sessionId}/start2`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return res.json();
    },

    lockGate2: async (sessionId) => {
        const res = await fetch(`${API_URL}/sessions/${sessionId}/lock2`, { method: "POST" });
        return res.json();
    },

    // --- QUESTIONS ---
    forgeQuestion: async (payload) => {
        const res = await fetch(`${API_URL}/questions/forge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to forge weapon");
        return res.json();
    },

    deleteQuestion: async (questionId) => {
        const res = await fetch(`${API_URL}/questions/${questionId}`, { 
            method: "DELETE" 
        });
        if (!res.ok) throw new Error("Failed to delete weapon");
        return res.json();
    },
getQuestions: async (quizId) => {
        const res = await fetch(`${API_URL}/questions/${quizId}`);
        if (!res.ok) throw new Error("Failed to open the vault");
        return res.json();
    },
    // --- QUIZZES ---
    getTeacherQuizzes: async (teacherId) => {
        const res = await fetch(`${API_URL}/quizzes/teacher/${teacherId}`);
        if (!res.ok) throw new Error("Failed to fetch archives");
        return res.json();
    },

    // --- AI FORGE ---
    parseWithGemini: async (payload) => {
        const res = await fetch(`${API_URL}/ai/parse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Gemini parsing failed");
        return res.json();
    },

    saveAIExam: async (payload) => {
        const res = await fetch(`${API_URL}/questions/ai-forge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to lock exam into vault");
        return res.json();
    }
};