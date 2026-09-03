import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from "@clerk/clerk-react";
import { shogunApi } from '../api';

export default function QuizArena() {
    const { user } = useUser();

    const [lobbyData, setLobbyData] = useState(null);
    const [liveQuestions, setLiveQuestions] = useState(null);
    const [myAnswers, setMyAnswers] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [selections, setSelections] = useState({});
    const [reviewQuestions, setReviewQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Use a ref so submitAllAnswers can access latest state without stale closure
    const selectionsRef = useRef(selections);
    const myAnswersRef = useRef(myAnswers);
    const liveQuestionsRef = useRef(liveQuestions);
    useEffect(() => { selectionsRef.current = selections; }, [selections]);
    useEffect(() => { myAnswersRef.current = myAnswers; }, [myAnswers]);
    useEffect(() => { liveQuestionsRef.current = liveQuestions; }, [liveQuestions]);

    // --- POLLING THE LOBBY STATE ---
    useEffect(() => {
        const playerId = localStorage.getItem("ikya_player_id");
        if (!playerId) return;

        const fetchState = async () => {
            try {
                const data = await shogunApi.getMyLobby(playerId);
                setLobbyData(data);
                if (data?.clan?.answers) {
                    const mine = data.clan.answers.filter(a => a.playerId === parseInt(playerId));
                    setMyAnswers(mine);
                }
            } catch (error) {
                console.error("Arena sync failed.");
            }
        };

        fetchState();
        const interval = setInterval(fetchState, 3000);
        return () => clearInterval(interval);
    }, []);

    // --- FETCH QUESTIONS ---
    useEffect(() => {
        if (!lobbyData?.session) return;
        if (liveQuestions !== null) return;

        const fetchQuestions = async () => {
            try {
                const data = await shogunApi.getQuestions(lobbyData.session.quizId);
                setLiveQuestions(data.questions);
            } catch (error) {
                console.error("Failed to open weapon vault.");
            }
        };
        fetchQuestions();
    }, [lobbyData, liveQuestions]);

    const clan = lobbyData?.clan;
    const session = lobbyData?.session;
    const players = lobbyData?.players || [];
    const me = players.find(p => p.clerkId === user?.id);

    // Use session.duration from DB — set by teacher, no hardcoding
    const TIME_LIMIT = (session?.duration || 30) * 60;

    // Reset state when session phase changes
    useEffect(() => {
        setSubmitted(false);
        setCurrentQ(0);
        setSelections({});
        setReviewQuestions([]);
    }, [session?.status]);

    // --- TIMER (driven by session.startTime + session.duration) ---
    useEffect(() => {
        if (!session?.startTime || !session?.duration) return;

        const tick = () => {
            const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
            const remaining = Math.max(0, TIME_LIMIT - elapsed);
            setTimeLeft(remaining);
            return remaining;
        };

        // Set immediately, then tick every second
        tick();
        const interval = setInterval(() => {
            const remaining = tick();
            if (remaining === 0) {
                clearInterval(interval);
                // Auto-submit when time runs out
                submitAllAnswers();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session?.startTime, session?.duration]);

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- ANTI-CHEAT ---
    const executeStrike = useCallback(async () => {
        if (!me) return;
        try { await shogunApi.logStrike({ playerId: me.id }); } catch (e) { console.error(e); }
    }, [me]);

    useEffect(() => {
        if (!session || !liveQuestions) return;
        const isGateActive = session.status === "active" || session.status === "active_gate_2";
        if (!isGateActive || timeLeft === 0 || submitted) {
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            return;
        }

        const enterFullscreen = async () => {
            try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); }
            catch (e) { console.log("Browser blocked auto-fullscreen."); }
        };
        enterFullscreen();

        const handleVisibilityChange = () => {
            if (document.hidden) { executeStrike(); alert("⚔️ DISHONOR: You switched tabs! A strike has been logged."); }
        };
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) { executeStrike(); alert("⚔️ DISHONOR: You exited fullscreen! A strike has been logged."); }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [executeStrike, session, liveQuestions, timeLeft, submitted]);

    // --- BULK SUBMIT: saves all pending selections then shows results ---
    const submitAllAnswers = async () => {
        if (!me || !session) return;
        const questions = liveQuestionsRef.current;
        const currentSelections = selectionsRef.current;
        const savedAnswers = myAnswersRef.current;
        if (!questions) return;

        const timeSpent = session.startTime
            ? Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000)
            : 0;

        const pending = questions.filter(q => {
            const alreadySaved = savedAnswers.find(a => a.questionId === q.id);
            return !alreadySaved && currentSelections[q.id];
        });

        for (const q of pending) {
            try {
                await shogunApi.submitAnswer({
                    playerId: me.id,
                    questionId: q.id,
                    sessionId: session.id,
                    answer: currentSelections[q.id],
                    timeSpent,
                });
            } catch (e) { console.error("Failed to submit Q", q.id, e); }
        }
        setSubmitted(true);
    };

    const handleEndTest = () => {
        if (window.confirm("End the test? All your saved and selected answers will be submitted.")) {
            submitAllAnswers();
        }
    };

    // --- LOADING ---
    if (!lobbyData || liveQuestions === null) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5fff6' }}>
                <h1 style={{ fontFamily: "'Shojumaru', cursive", color: '#8B0000' }}>UNSEALING THE VAULT...</h1>
            </div>
        );
    }

    if (liveQuestions.length === 0) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
                <h1 style={{ color: 'red', textAlign: 'center', fontFamily: "'Shojumaru', cursive" }}>ERROR: THE VAULT IS EMPTY.</h1>
            </div>
        );
    }

    if (me?.strikes >= 2) {
        return (
            <div style={{ backgroundColor: '#111', color: '#8B0000', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'Shojumaru', cursive" }}>
                <h1 style={{ fontSize: '5rem', margin: 0 }}>BANISHED</h1>
                <p style={{ fontFamily: "'Courier New', monospace", color: '#fff', fontSize: '1.5rem' }}>You have dishonored your clan. You are locked out.</p>
            </div>
        );
    }

    const calculateAnalytics = () => {
        let correctCount = 0, incorrectCount = 0;
        liveQuestions.forEach(q => {
            const myAns = myAnswers.find(a => a.questionId === q.id);
            if (myAns) {
                if (myAns.answer === q.correctAnswer) correctCount++;
                else incorrectCount++;
            }
        });
        const unansweredCount = Math.max(0, liveQuestions.length - myAnswers.length);
        return { correctCount, incorrectCount, unansweredCount };
    };

    const isGateActive = session?.status === "active" || session?.status === "active_gate_2";
    const isReportPhase = ["gate_1_complete", "eliminated", "tournament_complete"].includes(session?.status);

    // Show results immediately after student submits
    if (submitted || (isGateActive && timeLeft === 0) || isReportPhase) {
        const analytics = calculateAnalytics();
        const reportTitle = "Gate 1 (Foundation)";

        const handleEmailReport = () => {
            const subject = `SHINKEN - ${reportTitle} Report`;
            let body = `Samurai: ${me?.name}\nClan: ${clan?.name}\n\n`;
            body += `Score: ${analytics.correctCount} / ${liveQuestions.length}\n`;
            body += `Correct: ${analytics.correctCount} | Wrong: ${analytics.incorrectCount} | Unanswered: ${analytics.unansweredCount}\n\n`;
            liveQuestions.forEach((q, idx) => {
                const myAns = myAnswers.find(a => a.questionId === q.id);
                body += `Q${idx + 1}: ${q.title}\nYour Answer: ${myAns?.answer || "Not answered"}\nCorrect: ${q.correctAnswer}\n\n`;
            });
            const email = user?.primaryEmailAddress?.emailAddress || "";
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        };

        return (
            <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#eef2e6', backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")', padding: '4rem', fontFamily: "'Courier New', monospace" }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '4px solid #8B0000', paddingBottom: '2rem' }}>
                        <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '4rem', color: '#111', margin: 0 }}>
                            {timeLeft === 0 && !submitted ? "TIME'S UP!" : "BLADES SHEATHED"}
                        </h1>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8B0000', margin: '1rem 0 0 0' }}>
                            {clan?.name} — Your results are in.
                        </p>
                    </div>

                    {/* Score card */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                        <div style={{ backgroundColor: '#fff', border: '6px solid #111', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '12px 12px 0px #8B0000', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#666', fontSize: '1.2rem' }}>YOUR SCORE</p>
                            <div style={{ fontSize: '5rem', fontWeight: '900', color: '#8B0000', fontFamily: "'Shojumaru', cursive", lineHeight: 1 }}>
                                {analytics.correctCount}
                            </div>
                            <div style={{ fontSize: '1.5rem', color: '#111', fontWeight: 'bold' }}>/ {liveQuestions.length}</div>
                        </div>
                        <div style={{ backgroundColor: '#111', color: '#fff', border: '6px solid #8B0000', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.2rem' }}>✅ Correct:</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{analytics.correctCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.2rem' }}>❌ Wrong:</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{analytics.incorrectCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#aaa', fontWeight: 'bold', fontSize: '1.2rem' }}>⏳ Unanswered:</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{analytics.unansweredCount}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <button onClick={handleEmailReport} style={{ backgroundColor: '#111', color: '#fff', border: '4px solid #8B0000', padding: '1rem 2rem', fontFamily: "'Shojumaru', cursive", fontSize: '1.2rem', cursor: 'pointer', boxShadow: '6px 6px 0px #8B0000' }}>
                            📧 EMAIL REPORT
                        </button>
                    </div>

                    {/* Question-by-question breakdown */}
                    <h3 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2rem', color: '#111', marginBottom: '1.5rem' }}>Question Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {liveQuestions.map((q, idx) => {
                            const myAns = myAnswers.find(a => a.questionId === q.id);
                            const isCorrect = myAns?.answer === q.correctAnswer;
                            const didNotAnswer = !myAns;
                            return (
                                <div key={q.id} style={{ border: '3px solid #111', backgroundColor: didNotAnswer ? '#f5f5f5' : (isCorrect ? '#e8f5e9' : '#ffebee'), padding: '1.5rem' }}>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#8B0000' }}>Q{idx + 1}: {q.title}</p>
                                    <p style={{ margin: '0 0 0.3rem 0' }}><span style={{ color: '#666' }}>Your Answer: </span>{didNotAnswer ? "Not answered" : myAns.answer} {didNotAnswer ? '⏳' : (isCorrect ? '✅' : '❌')}</p>
                                    {!isCorrect && <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>Correct Answer: {q.correctAnswer}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const answeredQuestionIds = myAnswers.map(a => a.questionId);
    const question = liveQuestions[currentQ];
    if (!question) return null;

    const currentSelection = selections[question.id];
    const savedAnswer = myAnswers.find(a => a.questionId === question.id)?.answer;

    const handleOptionSelect = (opt) => setSelections({ ...selections, [question.id]: opt });

    const toggleReview = () => {
        if (reviewQuestions.includes(question.id)) setReviewQuestions(reviewQuestions.filter(id => id !== question.id));
        else setReviewQuestions([...reviewQuestions, question.id]);
    };

    const handleSaveAnswer = async () => {
        const answerToSave = currentSelection || savedAnswer;
        if (!answerToSave) return;
        const timeSpent = session.startTime ? Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000) : 0;
        try {
            await shogunApi.submitAnswer({
                playerId: me.id,
                questionId: question.id,
                sessionId: session.id,
                answer: answerToSave,
                timeSpent,
            });
            setReviewQuestions(reviewQuestions.filter(id => id !== question.id));
            if (currentQ < liveQuestions.length - 1) setCurrentQ(currentQ + 1);
        } catch (error) {
            console.error("VAULT ERROR:", error);
        }
    };

    const isTimeLow = timeLeft !== null && timeLeft < 300;

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', backgroundColor: '#eef2e6', backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")', fontFamily: "'Courier New', monospace", userSelect: 'none', overflow: 'hidden' }}>

            {/* --- LEFT SIDEBAR --- */}
            <div style={{ width: '320px', height: '100%', overflowY: 'auto', backgroundColor: '#111', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', borderRight: '6px solid #8B0000', flexShrink: 0 }}>
                <h2 style={{ fontFamily: "'Shojumaru', cursive", color: '#FF4500', textAlign: 'center', marginBottom: '0.5rem' }}>TIME LEFT</h2>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '2rem', color: isTimeLow ? '#FF0000' : '#fff', textShadow: '2px 2px 0px #8B0000' }}>
                    {formatTime(timeLeft)}
                </div>

                {/* Question grid */}
                <div style={{ borderTop: '2px dashed #444', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                        🟢 Answered &nbsp; 🔴 Unanswered &nbsp; 🟣 Review
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {liveQuestions.map((q, idx) => {
                            const isAnswered = answeredQuestionIds.includes(q.id);
                            const isReview = reviewQuestions.includes(q.id);
                            const isActive = currentQ === idx;
                            let bgColor = '#8B0000';
                            if (isReview) bgColor = '#6a1b9a';
                            else if (isAnswered) bgColor = '#2e7d32';
                            return (
                                <button key={q.id} onClick={() => setCurrentQ(idx)}
                                    style={{ aspectRatio: '1/1', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: bgColor, color: '#fff', border: isActive ? '3px solid #fff' : '2px solid #333', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* END TEST BUTTON */}
                <button onClick={handleEndTest}
                    style={{ marginTop: 'auto', backgroundColor: '#8B0000', color: '#fff', border: '3px solid #fff', padding: '1.2rem', fontFamily: "'Shojumaru', cursive", fontSize: '1.3rem', cursor: 'pointer', width: '100%', boxShadow: '4px 4px 0px rgba(255,255,255,0.2)' }}>
                    ⚔️ END TEST
                </button>
            </div>

            {/* --- MAIN QUESTION AREA --- */}
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #8B0000', paddingBottom: '1rem', marginBottom: '3rem', flexShrink: 0 }}>
                    <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2.5rem', margin: 0, color: '#111' }}>{clan?.name}</h2>
                    <span style={{ fontWeight: 'bold', color: '#666', alignSelf: 'center' }}>
                        {answeredQuestionIds.length} / {liveQuestions.length} answered
                    </span>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', border: '6px solid #111', padding: '3rem', boxShadow: '15px 15px 0px rgba(139,0,0,0.2)', flexShrink: 0 }}>
                    <p style={{ color: '#8B0000', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>QUESTION {currentQ + 1} OF {liveQuestions.length}</p>
                    <h3 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2rem', marginTop: 0 }}>{question.title}</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', lineHeight: '1.6' }}>{question.text}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {question.options.map((opt, idx) => {
                            const isSelected = currentSelection ? currentSelection === opt : savedAnswer === opt;
                            return (
                                <button key={idx} onClick={() => handleOptionSelect(opt)}
                                    style={{ textAlign: 'left', padding: '1.5rem', fontSize: '1.2rem', fontFamily: "'Courier New', monospace", fontWeight: 'bold', backgroundColor: isSelected ? '#111' : 'transparent', color: isSelected ? '#fff' : '#111', border: '3px solid #111', cursor: 'pointer' }}>
                                    <span style={{ color: isSelected ? '#FF69B4' : '#8B0000', marginRight: '1rem' }}>[{String.fromCharCode(65 + idx)}]</span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '2px dashed #ccc', paddingTop: '2rem' }}>
                        <button onClick={toggleReview} style={{ backgroundColor: 'transparent', color: '#6a1b9a', border: '3px solid #6a1b9a', padding: '1rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Courier New', monospace" }}>
                            {reviewQuestions.includes(question.id) ? '★ MARKED' : 'MARK FOR REVIEW'}
                        </button>
                        <button onClick={handleSaveAnswer} style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '1rem 3rem', border: '4px solid #111', cursor: 'pointer', fontFamily: "'Shojumaru', cursive", fontSize: '1.1rem' }}>
                            SAVE & NEXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
