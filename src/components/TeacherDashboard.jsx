import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { shogunApi } from '../api';
import FallingSakura from './FallingSakura';
import ExamForge from './ExamForge'; 

export default function TeacherDashboard() {
    const { user } = useUser();
    
    // --- STATE MANAGEMENT ---
    const [view, setView] = useState('armory'); 
    const [teacherQuizzes, setTeacherQuizzes] = useState([]);
    
    // Deployment & Preview States
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [previewData, setPreviewData] = useState({ title: '', questions: [] });
    // 🚨 Now storing answers and questions from the radar payload
    const [dashboardData, setDashboardData] = useState({ session: null, clans: [], players: [], answers: [], questions: [] });
    
    // Setup Config
    const [setupMode, setSetupMode] = useState('group');
    const [examDuration, setExamDuration] = useState(30);
    const [setupCerts, setSetupCerts] = useState(false);
    const [certFile, setCertFile] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);

    // --- 1. FETCH TEACHER'S ARCHIVES ---
    useEffect(() => {
        if (!user || view !== 'armory') return;
        
        const fetchArchives = async () => {
            try {
                const data = await shogunApi.getTeacherQuizzes(user.id);
                setTeacherQuizzes(data.quizzes || []);
            } catch (error) {
                console.error("Failed to load armory", error);
            }
        };
        fetchArchives();
    }, [user, view]);

    // --- 2. LIVE RADAR POLLING ---
    useEffect(() => {
        if (!user || view !== 'live_arena') return;
        
        const fetchRadar = async () => {
            try {
                const data = await shogunApi.getDashboard(user.id);
                setDashboardData(data);
                if (!data.session) setView('armory');
            } catch (error) {
                console.error("Radar Offline", error);
            }
        };

        fetchRadar(); 
        const interval = setInterval(fetchRadar, 3000); 
        return () => clearInterval(interval);
    }, [user, view]);

    // 🚨 Extracting the full payload from the backend
    const { session, clans: rawClans, players, answers, questions } = dashboardData;

    // --- 3. DYNAMIC SCORING LOGIC ---
    // 🚨 Real-time mark calculation based on actual answers in the DB
    const getClanScore = (clan) => {
        if (!answers || !questions) return 0;
        let points = 0;
        
        // Find all player IDs that belong to this specific clan
        const clanPlayerIds = players.filter(p => p.clanId === clan.id).map(p => p.id);
        // Find all answers submitted by those players
        const clanAnswers = answers.filter(a => clanPlayerIds.includes(a.playerId));

        // Tally up the marks
        clanAnswers.forEach(ans => {
            const q = questions.find(q => q.id === ans.questionId);
            if (q && q.correctAnswer === ans.answer) {
                points += 1; // +1 Mark for every correct answer
            }
        });
        
        return points;
    };

    const clans = [...(rawClans || [])].sort((a, b) => getClanScore(b) - getClanScore(a));

    const isPhase1 = session?.status === 'waiting_in_lobby';
    const isPhase2 = session?.status === 'active';
    const isPhase5 = session?.status === 'tournament_complete';

    // --- LIVE TIMER LOGIC ---
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (session && session.status === "active" && session.startTime) {
            const durationInSeconds = (session.duration || 30) * 60; 
            const interval = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
                const remainingSeconds = durationInSeconds - elapsedSeconds;

                if (remainingSeconds <= 0) {
                    setTimeLeft(0);
                    clearInterval(interval);
                } else {
                    setTimeLeft(remainingSeconds);
                }
            }, 1000);
            return () => clearInterval(interval);
        } else if (session) {
            setTimeLeft((session.duration || 30) * 60);
        }
    }, [session]);

    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    // --- HELPERS & ACTIONS ---
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handlePreview = async (quiz) => {
        try {
            const res = await shogunApi.getQuestions(quiz.id);
            setPreviewData({ title: quiz.title, questions: res.questions });
            setView('preview');
        } catch (error) {
            alert("Failed to unseal scroll details.");
        }
    };

    const handleInitialize = async () => {
        if (!selectedQuizId) return alert("Critical error: No quiz selected.");
        if (setupCerts && !certFile) return alert("Please upload a Certificate Template (Image/PDF).");
        
        setIsInitializing(true);
        try {
            const base64String = certFile ? await convertToBase64(certFile) : null;
            await shogunApi.initializeSession({
                hostId: user.id,
                mode: setupMode,
                duration: examDuration, 
                issueCertificates: setupCerts,
                certificateBase64: base64String, 
                quizId: selectedQuizId 
            });
            setView('live_arena');
        } catch (e) {
            alert("Initialization failed: " + (e?.message || e));
        } finally {
            setIsInitializing(false);
        }
    };

    const handleStart = async () => { if (window.confirm("Commence the Trials?")) await shogunApi.startTrials(session.id); };
    const handleReset = async () => { if (window.confirm("🚨 EMERGENCY RESTART: Erase all answers and send everyone to lobby?")) await shogunApi.resetTrials(session.id); };

    // ==========================================
    // RENDER: THE AI FORGE
    // ==========================================
    if (view === 'forge') return <ExamForge onBack={() => setView('armory')} />;

    return (
        <div style={{ 
            height: '100vh', width: '100vw', 
            backgroundColor: '#f5fff6', 
            backgroundImage: `linear-gradient(rgba(245, 255, 246, 0.7), rgba(245, 255, 246, 0.9)), url("/shogun-tent.jpg"), url("https://www.transparenttextures.com/patterns/rice-paper-2.png")`,
            backgroundSize: 'cover, cover, auto',
            backgroundPosition: 'center',
            backgroundBlendMode: 'normal, multiply, normal',
            padding: '3rem', fontFamily: "'Courier New', monospace", position: 'relative', overflowX: 'hidden', overflowY: 'auto' 
        }}>
            
            <FallingSakura />
            <span style={{ position: 'fixed', fontSize: '40vw', color: '#8B0000', opacity: 0.04, zIndex: 0, pointerEvents: 'none', userSelect: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>将</span>

            {/* KILL SWITCH */}
            {view === 'live_arena' && session && (
                <button onClick={handleReset} style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 100, backgroundColor: 'transparent', color: '#8B0000', fontFamily: "'Courier New', monospace", fontSize: '1rem', fontWeight: 'bold', padding: '0.8rem 1.5rem', border: '3px solid #8B0000', cursor: 'pointer' }}>
                    [ EMERGENCY KILL SWITCH ]
                </button>
            )}

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '4px solid #8B0000' }}>
                    <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '5rem', color: '#111', margin: 0, textShadow: '4px 4px 0px rgba(139,0,0,0.2)' }}>SHOGUN COMMAND</h1>
                </div>

                {/* ========================================== */}
                {/* STATE 1: THE ARMORY (List of Exams)        */}
                {/* ========================================== */}
                {view === 'armory' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                            <button onClick={() => setView('forge')} className="ink-button primary" style={{ fontSize: '1.5rem' }}>
                                ⚔️ FORGE NEW EXAM
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h2 style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '3rem', color: '#8B0000', margin: '0 0 1rem 0' }}>Your Arsenal</h2>
                            
                            {teacherQuizzes.length === 0 ? (
                                <p style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '2rem', border: '3px dashed #111', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    Your vault is empty. Forge a new exam to begin.
                                </p>
                            ) : (
                                teacherQuizzes.map(quiz => (
                                    <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '2rem', border: '4px solid #111', boxShadow: '8px 8px 0px rgba(139,0,0,0.2)' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontFamily: "'Shojumaru', cursive", color: '#111' }}>{quiz.title}</h3>
                                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Scroll ID: {quiz.id} | Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => handlePreview(quiz)} style={{ backgroundColor: 'transparent', color: '#111', border: '3px solid #111', padding: '0.8rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Courier New', monospace" }}>
                                                🔍 PREVIEW
                                            </button>
                                            <button onClick={() => { setSelectedQuizId(quiz.id); setView('deploy_setup'); }} style={{ backgroundColor: '#8B0000', color: '#fff', border: '3px solid #111', padding: '0.8rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Courier New', monospace", boxShadow: '4px 4px 0px #111' }}>
                                                ⚔️ DEPLOY
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* ========================================== */}
                {/* STATE 2: PREVIEW EXAM QUESTIONS            */}
                {/* ========================================== */}
                {view === 'preview' && (
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '3rem', border: '4px solid #111', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)' }}>
                        <button onClick={() => setView('armory')} style={{ backgroundColor: 'transparent', color: '#8B0000', border: 'none', padding: 0, fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', textDecoration: 'underline', marginBottom: '2rem' }}>
                            ← Back to Armory
                        </button>
                        
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2.5rem', margin: '0 0 2rem 0', color: '#111', borderBottom: '4px solid #8B0000', paddingBottom: '1rem' }}>
                            {previewData.title}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {previewData.questions.length === 0 ? <p>No questions found in this scroll.</p> : null}
                            
                            {previewData.questions.map((q, idx) => (
                                <div key={idx} style={{ padding: '1.5rem', border: '2px solid #ccc', backgroundColor: '#f9f9f9' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 1rem 0' }}>Q{idx + 1}: {q.text}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} style={{ padding: '0.5rem', border: '1px solid #ddd', backgroundColor: q.correctAnswer === opt ? '#e8f5e9' : 'transparent' }}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>True Answer: {q.correctAnswer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* STATE 3: DEPLOYMENT CONFIGURATION          */}
                {/* ========================================== */}
                {view === 'deploy_setup' && (
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '4px dashed #8B0000', padding: '4rem', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)' }}>
                        <button onClick={() => setView('armory')} style={{ backgroundColor: 'transparent', color: '#8B0000', border: 'none', padding: 0, fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', textDecoration: 'underline', marginBottom: '2rem' }}>
                            ← Cancel Deployment
                        </button>

                        <h2 style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '3rem', color: '#8B0000', margin: '0 0 2rem 0', textAlign: 'center' }}>Configure Arena</h2>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ color: '#111', fontSize: '1.2rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Combat Style:</label>
                            <select value={setupMode} onChange={(e) => setSetupMode(e.target.value)} style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', backgroundColor: 'transparent', color: '#111', border: '3px solid #111', fontFamily: "'Courier New', monospace", fontWeight: 'bold' }}>
                                <option value="group">Group Combat (Clans of 4)</option>
                                <option value="solo">Lone Wolf (Solo Deathmatch)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ color: '#111', fontSize: '1.2rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Exam Duration (Minutes):</label>
                            <input 
                                type="number" min="1" max="180"
                                value={examDuration} 
                                onChange={(e) => setExamDuration(parseInt(e.target.value))} 
                                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', backgroundColor: 'transparent', color: '#111', border: '3px solid #111', fontFamily: "'Courier New', monospace", fontWeight: 'bold' }} 
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked={setupCerts} onChange={(e) => setSetupCerts(e.target.checked)} style={{ transform: 'scale(1.5)', accentColor: '#8B0000' }} />
                            <label style={{ color: '#111', fontSize: '1.2rem', fontWeight: 'bold' }}>Automatically Issue Victory Certificates</label>
                        </div>

                        {setupCerts && (
                            <div style={{ marginBottom: '3rem', padding: '2rem', border: '3px dashed #111', backgroundColor: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                <label style={{ color: '#111', fontSize: '1.2rem', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>Upload Certificate Template (PDF/PNG/JPG):</label>
                                <input type="file" accept="image/png, image/jpeg, application/pdf" onChange={(e) => setCertFile(e.target.files[0])} style={{ fontSize: '1.1rem', fontFamily: "'Courier New', monospace" }} />
                                {certFile && <p style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: '1rem' }}>✅ Attached: {certFile.name}</p>}
                            </div>
                        )}

                        <button onClick={handleInitialize} disabled={isInitializing} className="ink-button primary" style={{ width: '100%' }}>
                            {isInitializing ? "GENERATING PIN..." : "OPEN LOBBY & GENERATE PIN"}
                        </button>
                    </div>
                )}

                {/* ========================================== */}
                {/* STATE 4: LIVE ARENA                        */}
                {/* ========================================== */}
                {view === 'live_arena' && session && (
                    <>
                        {isPhase1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '6px solid #111', padding: '4rem', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)' }}>
                                <h2 style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '2rem', color: '#111', margin: '0 0 1rem 0' }}>Share this PIN with your students:</h2>
                                <div style={{ backgroundColor: '#8B0000', color: '#fff', padding: '1.5rem 4rem', fontSize: '6rem', fontWeight: '900', border: '6px solid #111', letterSpacing: '12px', marginBottom: '3rem', boxShadow: '8px 8px 0px #111', fontFamily: "'Courier New', monospace" }}>
                                    {session.pin}
                                </div>
                                <button className="ink-button primary" onClick={handleStart} style={{ fontSize: '2rem' }}>COMMENCE THE TRIALS</button>
                                <p style={{ fontFamily: "'Courier New', monospace", fontSize: '1.5rem', color: '#666', marginTop: '2rem', fontWeight: 'bold' }}>{players?.length || 0} Samurai waiting in the lobby...</p>
                            </div>
                        )}

                        {isPhase2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '8px solid #8B0000', padding: '2rem 4rem', marginBottom: '4rem', boxShadow: '15px 15px 0px rgba(139,0,0,0.2)', textAlign: 'center' }}>
                                    <p style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '2rem', color: '#8B0000', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Arena is Active</p>
                                    <h2 style={{ fontFamily: "'Courier New', monospace", fontSize: '8rem', color: '#111', margin: 0, lineHeight: '1' }}>{minutes}:{seconds}</h2>
                                </div>

                                <div style={{ width: '100%' }}>
                                    <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '3.5rem', color: '#111', textAlign: 'center', marginBottom: '3rem', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                                        LIVE RANKINGS
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
                                        {clans.map((clan, index) => {
                                            const score = getClanScore(clan);
                                            let bgColor = 'rgba(255,255,255,0.9)'; let borderColor = '#111';
                                            if (index === 0) { borderColor = '#FFD700'; bgColor = '#fffcf0'; }

                                            return (
                                                <div key={clan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `4px solid ${borderColor}`, backgroundColor: bgColor, padding: '1.5rem 2.5rem', boxShadow: index === 0 ? '8px 8px 0px rgba(255,215,0,0.3)' : '8px 8px 0px rgba(0,0,0,0.1)'}}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                        <span style={{ fontSize: '3rem', fontWeight: '900', color: index === 0 ? '#FFD700' : '#111', fontFamily: "'Shojumaru', cursive" }}>#{index + 1}</span>
                                                        <span style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '2.5rem', fontWeight: 'bold', color: '#111' }}>{clan.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                        <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111' }}>{score} <span style={{ fontSize: '1.5rem', color: '#666' }}>PTS</span></span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isPhase5 && (
                            <div style={{ textAlign: 'center', marginBottom: '4rem', backgroundColor: 'rgba(255,255,255,0.95)', padding: '4rem', border: '8px solid #FFD700', boxShadow: '15px 15px 0px rgba(255,215,0,0.3)' }}>
                                <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '5rem', color: '#111', margin: '0 0 1rem 0' }}>CHAMPIONS OF SHINKEN</h2>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '3rem' }}>
                                    {clans.filter(c => c.status === "tournament_complete").slice(0, 2).map((clan, index) => (
                                        <div key={clan.id} style={{ border: `8px solid ${index === 0 ? '#FFD700' : '#C0C0C0'}`, backgroundColor: '#fff', padding: '3rem', width: index === 0 ? '450px' : '400px', boxShadow: `12px 12px 0px ${index === 0 ? 'rgba(255,215,0,0.4)' : 'rgba(192,192,192,0.4)'}`, position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', fontSize: '6rem' }}>{index === 0 ? '👑' : '🥈'}</div>
                                            <h1 style={{ fontSize: '3rem', margin: '2rem 0 1rem 0', fontFamily: "'Shojumaru', cursive", color: index === 0 ? '#FFD700' : '#C0C0C0' }}>{index === 0 ? "GOLD" : "SILVER"}</h1>
                                            <h2 style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '3rem', margin: 0, color: '#111' }}>{clan.name}</h2>
                                            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111', marginTop: '1rem' }}>{getClanScore(clan)} PTS</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setView('armory')} className="ink-button primary" style={{ marginTop: '3rem', fontSize: '1.2rem' }}>Return to Armory</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}