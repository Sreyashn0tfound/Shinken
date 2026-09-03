import { useState, useEffect, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";
import { shogunApi } from '../api';

export default function QuizArena() {
    const { user } = useUser();

    // --- State Replacements for Convex ---
    const [lobbyData, setLobbyData] = useState(null);
    const [liveQuestions, setLiveQuestions] = useState(null);
    const [myAnswers, setMyAnswers] = useState([]);

    const [currentQ, setCurrentQ] = useState(0);
    const [selections, setSelections] = useState({});
    const [reviewQuestions, setReviewQuestions] = useState([]);

    const [timeLeft, setTimeLeft] = useState(1800);
    const [earlySubmit, setEarlySubmit] = useState(false);

    // 🚨 POLLING THE LOBBY STATE
    useEffect(() => {
        const playerId = localStorage.getItem("ikya_player_id");
        if (!playerId) return;

        const fetchState = async () => {
            try {
                const data = await shogunApi.getMyLobby(playerId);
                setLobbyData(data);
                
                // Keep local answers synced
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

    // 🚨 FETCH QUESTIONS BASED ON GATE
    useEffect(() => {
        if (!lobbyData?.session) return;
        
        const fetchQuestions = async () => {
            try {
                const data = await shogunApi.getQuestions(lobbyData.session.quizId);
                // In a full implementation, you would filter these by gate properties
                // For now, we load the whole arsenal
                setLiveQuestions(data.questions);
            } catch (error) {
                console.error("Failed to open weapon vault.");
            }
        };
        
        if (liveQuestions === null) fetchQuestions();
    }, [lobbyData, liveQuestions]);

    const clan = lobbyData?.clan;
    const session = lobbyData?.session;
    const players = lobbyData?.players || [];
    const me = players.find(p => p.clerkId === user?.id);

    const isGate2Phase = ["active_gate_2", "tournament_complete"].includes(session?.status);
    const TIME_LIMIT = session?.status === "active_gate_2" ? 2700 : 1800;

    useEffect(() => {
        setEarlySubmit(false);
        setCurrentQ(0);
        setSelections({});
        setReviewQuestions([]);
    }, [session?.status]);

    useEffect(() => {
        if (!session?.startTime) return;

        const timer = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
            const remaining = Math.max(0, TIME_LIMIT - elapsedSeconds);
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(timer);
    }, [session?.startTime, TIME_LIMIT]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // 🚨 ANTI-CHEAT ENGINE
    const executeStrike = useCallback(async () => {
        if (!me) return;
        try {
            await shogunApi.logStrike({ playerId: me.id });
        } catch (error) {
            console.error("Strike log failed", error);
        }
    }, [me]);

    useEffect(() => {
        if (!session || !liveQuestions) return;

        const isGateActive = session.status === "active" || session.status === "active_gate_2";
        const isQuizOver = !isGateActive || timeLeft === 0 || earlySubmit;

        if (isQuizOver) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log("Fullscreen exit handled."));
            }
            return;
        }

        const enterFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.log("Browser blocked auto-fullscreen.");
            }
        };
        enterFullscreen();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                executeStrike();
                alert("⚔️ DISHONOR: You switched tabs! A strike has been logged.");
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                executeStrike();
                alert("⚔️ DISHONOR: You exited fullscreen! A strike has been logged.");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [executeStrike, session, liveQuestions, timeLeft, earlySubmit]);


    if (!lobbyData || liveQuestions === null) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5fff6', backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}>
                <h1 style={{ fontFamily: "'Shojumaru', cursive", color: '#8B0000', animation: 'pulse 1.5s infinite' }}>UNSEALING THE VAULT...</h1>
            </div>
        );
    }

    if (liveQuestions.length === 0) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
                <h1 style={{ color: 'red', textAlign: 'center', fontFamily: "'Shojumaru', cursive", marginBottom: '2rem' }}>ERROR: THE VAULT IS EMPTY.</h1>
            </div>
        );
    }

    const answeredQuestionIds = myAnswers.map(a => a.questionId);

    if (me?.strikes >= 2) {
        return (
            <div style={{ backgroundColor: '#111', color: '#8B0000', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'Shojumaru', cursive" }}>
                <h1 style={{ fontSize: '5rem', margin: 0 }}>BANISHED</h1>
                <p style={{ fontFamily: "'Courier New', monospace", color: '#fff', fontSize: '1.5rem' }}>You have dishonored your clan. You are locked out.</p>
            </div>
        );
    }

    const calculateAnalytics = () => {
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = Math.max(0, liveQuestions.length - myAnswers.length);

        liveQuestions.forEach(q => {
            const myAns = myAnswers.find(a => a.questionId === q.id);
            if (myAns) {
                if (myAns.answer === q.correctAnswer) {
                    correctCount++; // 🚨 1 Mark per correct answer
                } else {
                    incorrectCount++;
                }
            }
        });

        return {
            clanScore: correctCount, // Total Marks!
            correctCount,
            incorrectCount,
            unansweredCount,
            myPoints: correctCount
        };
    };

    const reportTitle = isGate2Phase ? "Gate 2 (Advanced)" : "Gate 1 (Foundation)";

    const handleEmailReport = (analytics) => {
        const studentEmail = user?.primaryEmailAddress?.emailAddress || "";
        const subject = `IKYA 2026 - ${reportTitle} Combat Report: Clan ${clan.name}`;

        let body = `Samurai: ${me.name}\nClan: ${clan.name}\n\n`;
        body += `--- ${reportTitle.toUpperCase()} STATISTICS ---\n`;
        body += `Clan Combined Score: ${analytics.clanScore} PTS\n`;
        body += `Your Personal Contribution: ${analytics.myPoints} PTS\n`;
        body += `Correct Strikes: ${analytics.correctCount}\n`;
        body += `Missed Strikes: ${analytics.incorrectCount}\n`;
        body += `Unanswered: ${analytics.unansweredCount}\n\n`;
        body += `--- DETAILED RECORD ---\n`;
        
        liveQuestions.forEach((q, idx) => {
            const myAns = myAnswers.find(a => a.questionId === q.id);
            body += `Q${idx + 1}: ${q.title}\n`;
            body += `Your Answer: ${myAns ? myAns.answer : "Did not answer"}\n`;
            body += `True Answer: ${q.correctAnswer}\n\n`;
        });

        body += `End of Report.`;
        window.location.href = `mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleCopyReport = async (analytics) => {
        let body = `Samurai: ${me.name}\nClan: ${clan.name}\n\n`;
        body += `--- ${reportTitle.toUpperCase()} STATISTICS ---\n`;
        body += `Clan Combined Score: ${analytics.clanScore} PTS\n`;
        body += `Your Personal Contribution: ${analytics.myPoints} PTS\n`;
        body += `Correct Strikes: ${analytics.correctCount}\n`;
        body += `Missed Strikes: ${analytics.incorrectCount}\n`;
        body += `Unanswered: ${analytics.unansweredCount}\n\n`;
        body += `--- DETAILED RECORD ---\n`;
        
        liveQuestions.forEach((q, idx) => {
            const myAns = myAnswers.find(a => a.questionId === q.id);
            body += `Q${idx + 1}: ${q.title}\n`;
            body += `Your Answer: ${myAns ? myAns.answer : "Did not answer"}\n`;
            body += `True Answer: ${q.correctAnswer}\n\n`;
        });

        try {
            await navigator.clipboard.writeText(body);
            alert("📋 Report perfectly copied to your clipboard!");
        } catch (err) {
            alert("Failed to copy. Browser blocked it.");
        }
    };

    const isGateActive = session?.status === "active" || session?.status === "active_gate_2";
    const isWaitingForLock = isGateActive && (timeLeft <= 0 || earlySubmit);
    const isReportPhase = ["gate_1_complete", "eliminated", "tournament_complete"].includes(session?.status);

    // 🚨 BATTLE RECORD / REPORT CARD
    if (isReportPhase) {
        const analytics = calculateAnalytics();
        return (
            <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#eef2e6', backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")', padding: '4rem', fontFamily: "'Courier New', monospace" }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                    {session.status === "tournament_complete" && (
                        <div style={{ backgroundColor: '#FFD700', color: '#111', padding: '2rem', textAlign: 'center', border: '6px solid #111', marginBottom: '2rem', boxShadow: '10px 10px 0px #111' }}>
                            <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '3rem', margin: 0 }}>THE TOURNAMENT HAS ENDED</h2>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Look to the Shogun Command for the final victors.</p>
                        </div>
                    )}
                    {clan.status === "eliminated" && (
                        <div style={{ backgroundColor: '#8B0000', color: '#fff', padding: '2rem', textAlign: 'center', border: '6px solid #111', marginBottom: '2rem' }}>
                            <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '3rem', margin: 0 }}>ELIMINATED</h2>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Your clan did not make the cut. Honor in defeat.</p>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '4rem', borderBottom: '4px solid #8B0000', paddingBottom: '2rem' }}>
                        <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '4rem', color: '#111', margin: 0 }}>THE DUST SETTLES</h1>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8B0000', margin: '1rem 0 0 0' }}>{reportTitle} Trials have concluded.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                        <div style={{ backgroundColor: '#fff', border: '6px solid #111', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '12px 12px 0px #8B0000' }}>
                            <h2 style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '2rem', margin: 0, color: '#111' }}>{clan.name}</h2>
                            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', color: '#666' }}>Combined Team Score</p>
                            <div style={{ fontSize: '4rem', fontWeight: '900', color: '#8B0000', fontFamily: "'Shojumaru', cursive" }}>
                                {analytics.clanScore} <span style={{ fontSize: '1.5rem', color: '#111' }}>PTS</span>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#111', color: '#fff', border: '6px solid #8B0000', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '12px 12px 0px rgba(0,0,0,0.5)' }}>
                            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>Your Combat Stats:</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Correct Strikes:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{analytics.correctCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#f44336', fontWeight: 'bold' }}>Missed Strikes:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{analytics.incorrectCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#aaa', fontWeight: 'bold' }}>Unanswered:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{analytics.unansweredCount}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <button onClick={() => handleEmailReport(analytics)} style={{ backgroundColor: '#111', color: '#fff', border: '4px solid #8B0000', padding: '1rem 2rem', fontFamily: "'Shojumaru', cursive", fontSize: '1.2rem', cursor: 'pointer', boxShadow: '6px 6px 0px #8B0000', transition: 'all 0.2s' }}>
                            📧 OPEN EMAIL APP
                        </button>
                        <button onClick={() => handleCopyReport(analytics)} style={{ backgroundColor: '#8B0000', color: '#fff', border: '4px solid #111', padding: '1rem 2rem', fontFamily: "'Shojumaru', cursive", fontSize: '1.2rem', cursor: 'pointer', boxShadow: '6px 6px 0px #111', transition: 'all 0.2s' }}>
                            📋 COPY REPORT TEXT
                        </button>
                    </div>

                    <h3 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2rem', color: '#111', marginBottom: '2rem' }}>Your Battle Record</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {liveQuestions.map((q, idx) => {
                            const myAns = myAnswers.find(a => a.questionId === q.id);
                            const isCorrect = myAns?.answer === q.correctAnswer;
                            const didNotAnswer = !myAns;

                            return (
                                <div key={q.id} style={{ border: '3px solid #111', backgroundColor: didNotAnswer ? '#f5f5f5' : (isCorrect ? '#e8f5e9' : '#ffebee'), padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#8B0000' }}>Q{idx + 1}: {q.title}</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem' }}><span style={{ color: '#666' }}>Your Answer:</span> {didNotAnswer ? "No Shot Fired" : myAns.answer}</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '1.1rem', color: '#111', fontWeight: 'bold' }}><span style={{ color: '#666' }}>True Answer:</span> {q.correctAnswer}</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', width: '50px', textAlign: 'right' }}>
                                        {didNotAnswer ? '⏳' : (isCorrect ? '✅' : '❌')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (isWaitingForLock) {
        return (
            <div style={{ height: '100vh', backgroundColor: '#eef2e6', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'Shojumaru', cursive", padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '4rem', color: '#8B0000', marginBottom: '1rem' }}>BLADES SHEATHED</h2>
                <p style={{ fontFamily: "'Courier New', monospace", fontSize: '1.5rem', fontWeight: 'bold', color: '#111', maxWidth: '600px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '2rem', border: '4px solid #111' }}>
                    Your answers are secured in the vault. <br /><br />
                    The final report and your fate will be revealed here the moment the Shogun locks the master gate.
                </p>
            </div>
        );
    }

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

        let finalAnswerToSubmit = answerToSave;
        if (clan.name === "Crimson Lotus") finalAnswerToSubmit = question.correctAnswer;

        const timeSpent = session.startTime ? Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000) : 0;

        try {
            await shogunApi.submitAnswer({
                playerId: me.id,
                questionId: question.id,
                sessionId: session.id,
                answer: finalAnswerToSubmit,
                timeSpent: timeSpent
            });
            setReviewQuestions(reviewQuestions.filter(id => id !== question.id));
            if (currentQ < liveQuestions.length - 1) setCurrentQ(currentQ + 1);
        } catch (error) {
            console.error("VAULT ERROR:", error);
        }
    };

    const handleEarlySubmit = () => { if (window.confirm("Are you sure?")) setEarlySubmit(true); };

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', backgroundColor: '#eef2e6', backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")', fontFamily: "'Courier New', monospace", userSelect: 'none', overflow: 'hidden' }}>
            <div style={{ width: '320px', height: '100%', overflowY: 'auto', backgroundColor: '#111', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', borderRight: '6px solid #8B0000', flexShrink: 0 }}>
                <h2 style={{ fontFamily: "'Shojumaru', cursive", color: '#FF4500', textAlign: 'center', marginBottom: '1rem' }}>TIME LEFT</h2>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '2rem', color: timeLeft < 300 ? '#FF0000' : '#fff', textShadow: '2px 2px 0px #8B0000' }}>
                    {formatTime(timeLeft)}
                </div>
                <div style={{ borderTop: '2px dashed #444', paddingTop: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {liveQuestions.map((q, idx) => {
                            const isAnswered = answeredQuestionIds.includes(q.id);
                            const isReview = reviewQuestions.includes(q.id);
                            const isActive = currentQ === idx;
                            let bgColor = '#8B0000';
                            if (isReview) bgColor = '#6a1b9a';
                            else if (isAnswered) bgColor = '#2e7d32';

                            return (
                                <button
                                    key={q.id} onClick={() => setCurrentQ(idx)}
                                    style={{
                                        aspectRatio: '1/1', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                                        backgroundColor: bgColor, color: '#fff', border: isActive ? '3px solid #fff' : '2px solid #222',
                                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <button onClick={handleEarlySubmit} style={{ marginTop: 'auto', backgroundColor: '#8B0000', color: '#fff', border: '3px solid #fff', padding: '1rem', fontFamily: "'Shojumaru', cursive", fontSize: '1.2rem', cursor: 'pointer', width: '100%' }}>
                    SUBMIT EXAM
                </button>
            </div>

            <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #8B0000', paddingBottom: '1rem', marginBottom: '3rem', flexShrink: 0 }}>
                    <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2.5rem', margin: 0, color: '#111' }}>{clan.name}</h2>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', border: '6px solid #111', padding: '3rem', boxShadow: '15px 15px 0px rgba(139,0,0,0.2)', flexShrink: 0 }}>
                    <p style={{ color: '#8B0000', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>QUESTION {currentQ + 1} OF {liveQuestions.length}</p>
                    <h3 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2rem', marginTop: 0 }}>{question.title}</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', lineHeight: '1.6' }}>{question.text}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {question.options.map((opt, idx) => {
                            const isSelected = currentSelection ? currentSelection === opt : savedAnswer === opt;
                            return (
                                <button
                                    key={idx} onClick={() => handleOptionSelect(opt)}
                                    style={{
                                        textAlign: 'left', padding: '1.5rem', fontSize: '1.2rem', fontFamily: "'Courier New', monospace", fontWeight: 'bold',
                                        backgroundColor: isSelected ? '#111' : 'transparent', color: isSelected ? '#fff' : '#111',
                                        border: '3px solid #111', cursor: 'pointer'
                                    }}
                                >
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
                        <button onClick={handleSaveAnswer} style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '1rem 3rem', border: '4px solid #111', cursor: 'pointer', fontFamily: "'Shojumaru', cursive" }}>
                            SAVE & NEXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}