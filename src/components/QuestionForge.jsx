import { useState, useEffect } from 'react';
import { shogunApi } from '../api';
import FallingSakura from './FallingSakura';

export default function QuestionForge() {
    // --- STATE REPLACEMENTS FOR CONVEX ---
    const [gate1Questions, setGate1Questions] = useState([]);
    const [gate2Questions, setGate2Questions] = useState([]);
    
    // Trigger to re-fetch data after adding/deleting
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchVault = async () => {
            try {
                // Assuming quizId 1 = Gate 1, quizId 2 = Gate 2
                const g1Data = await shogunApi.getQuestions(1);
                const g2Data = await shogunApi.getQuestions(2);
                setGate1Questions(g1Data.questions || []);
                setGate2Questions(g2Data.questions || []);
            } catch (error) {
                console.error("Failed to load vault archives", error);
            }
        };
        fetchVault();
    }, [refreshTrigger]);

    // --- SECURITY STATE ---
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passcode, setPasscode] = useState("");

    // Form State
    const [gate, setGate] = useState("gate_1");
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctIndex, setCorrectIndex] = useState(null);

    // --- THE LOCK SCREEN ---
    if (!isUnlocked) {
        return (
            <div style={{
                height: '100vh', width: '100%', boxSizing: 'border-box',
                backgroundColor: '#f5fff6',
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                fontFamily: "'Courier New', monospace", position: 'relative', overflow: 'hidden'
            }}>
                <FallingSakura />
                <div style={{ zIndex: 10, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: '4rem', border: '6px solid #8B0000', boxShadow: '15px 15px 0px rgba(139,0,0,0.2)' }}>
                    <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '4rem', color: '#111', margin: '0 0 1rem 0' }}>
                        RESTRICTED AREA
                    </h1>
                    <p style={{ color: '#8B0000', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', fontFamily: "'Kaushan Script', cursive" }}>
                        Enter Master Passcode to access The Forge.
                    </p>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (passcode.trim() !== "") setIsUnlocked(true);
                    }} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <input
                            type="password" placeholder="Passcode..." value={passcode} onChange={(e) => setPasscode(e.target.value)}
                            style={{ padding: '1rem', fontSize: '1.5rem', backgroundColor: 'transparent', color: '#111', border: '3px solid #111', textAlign: 'center', letterSpacing: '5px', fontWeight: 'bold' }}
                            autoFocus
                        />
                        <button type="submit" style={{ backgroundColor: '#8B0000', color: '#fff', border: '3px solid #111', padding: '0 2rem', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Shojumaru', cursive" }}>
                            UNLOCK
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- THE MAIN FORGE LOGIC ---
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleForge = async (e) => {
        e.preventDefault();

        if (correctIndex === null) return alert("Select the correct answer!");
        if (options.some(opt => opt.trim() === "")) return alert("Fill all 4 options!");

        try {
            await shogunApi.forgeQuestion({
                quizId: gate === "gate_1" ? 1 : 2, 
                title: title, 
                text: text, 
                options: options, 
                correctAnswer: options[correctIndex]
            });
            setTitle(""); setText(""); setOptions(["", "", "", ""]); setCorrectIndex(null);
            setRefreshTrigger(prev => prev + 1); // Trigger refetch
            alert("Weapon Forged Successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to destroy this question?")) {
            try { 
                await shogunApi.deleteQuestion(id);
                setRefreshTrigger(prev => prev + 1); // Trigger refetch
            }
            catch (error) { alert(error.message); }
        }
    };

    return (
        <div style={{
            height: '100vh', width: '100%', boxSizing: 'border-box',
            backgroundColor: '#f5fff6',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
            padding: '4rem 2rem', fontFamily: "'Courier New', monospace", color: '#111',
            overflowY: 'auto', overflowX: 'hidden', position: 'relative'
        }}>
            <FallingSakura />

            {/* GIANT WATERMARK */}
            <span style={{ position: 'fixed', fontSize: '40vw', color: '#8B0000', opacity: 0.03, zIndex: 0, pointerEvents: 'none', userSelect: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                鍛
            </span>

            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #8B0000', paddingBottom: '1rem', marginBottom: '3rem' }}>
                    <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '4rem', color: '#111', margin: 0, textShadow: '3px 3px 0px rgba(139,0,0,0.2)' }}>
                        THE QUESTION FORGE
                    </h1>
                    <button onClick={() => setIsUnlocked(false)} style={{ backgroundColor: '#fff', color: '#8B0000', border: '3px solid #111', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '4px 4px 0px #111' }}>
                        LOCK VAULT
                    </button>
                </div>

                {/* THE FORGE FORM */}
                <form onSubmit={handleForge} style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '3rem', border: '4px dashed #8B0000', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)', marginBottom: '4rem' }}>

                    <div style={{ display: 'flex', gap: '3rem', marginBottom: '2.5rem', borderBottom: '2px solid #ccc', paddingBottom: '1.5rem' }}>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: gate === "gate_1" ? '#8B0000' : '#666' }}>
                            <input type="radio" checked={gate === "gate_1"} onChange={() => setGate("gate_1")} style={{ transform: 'scale(1.5)', accentColor: '#8B0000' }} />
                            Gate 1 (Foundation)
                        </label>
                        <label style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: gate === "gate_2" ? '#8B0000' : '#666' }}>
                            <input type="radio" checked={gate === "gate_2"} onChange={() => setGate("gate_2")} style={{ transform: 'scale(1.5)', accentColor: '#8B0000' }} />
                            Gate 2 (Advanced)
                        </label>
                    </div>

                    <input type="text" placeholder="Question Title (e.g. The Pointer's Edge)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'transparent', color: '#111', border: '3px solid #111', marginBottom: '1.5rem', fontFamily: "'Courier New', monospace", fontWeight: 'bold' }} />
                    <textarea placeholder="The actual question text..." value={text} onChange={(e) => setText(e.target.value)} required rows="4" style={{ width: '100%', boxSizing: 'border-box', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'transparent', color: '#111', border: '3px solid #111', marginBottom: '2.5rem', fontFamily: "'Courier New', monospace", fontWeight: 'bold' }} />

                    <h3 style={{ fontFamily: "'Kaushan Script', cursive", color: '#8B0000', fontSize: '1.8rem', margin: '0 0 1.5rem 0' }}>The 4 Options (Select the True Answer)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="radio" name="correctAnswer" checked={correctIndex === index} onChange={() => setCorrectIndex(index)} style={{ transform: 'scale(1.8)', cursor: 'pointer', accentColor: '#8B0000' }} />
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: correctIndex === index ? '#8B0000' : '#111' }}>[{String.fromCharCode(65 + index)}]</span>
                                <input type="text" placeholder={`Option ${index + 1}`} value={options[index]} onChange={(e) => handleOptionChange(index, e.target.value)} required style={{ flex: 1, boxSizing: 'border-box', padding: '1rem', fontSize: '1.2rem', backgroundColor: correctIndex === index ? '#ffe6e6' : 'transparent', color: '#111', border: correctIndex === index ? '3px solid #8B0000' : '2px solid #ccc', fontFamily: "'Courier New', monospace", fontWeight: 'bold', transition: 'all 0.2s ease' }} />
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#8B0000', color: '#fff', padding: '1.5rem', fontSize: '2rem', fontFamily: "'Shojumaru', cursive", border: '6px solid #111', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '8px 8px 0px #111', transition: 'transform 0.1s' }} onMouseDown={(e) => e.target.style.transform = 'translate(4px, 4px)'} onMouseUp={(e) => e.target.style.transform = 'translate(0px, 0px)'}>
                        Forge Weapon Into Database
                    </button>
                </form>

                {/* THE VAULT */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '4px solid #111', padding: '3rem', boxShadow: '12px 12px 0px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '3rem', color: '#111', borderBottom: '4px solid #8B0000', paddingBottom: '1rem', margin: '0 0 2rem 0' }}>THE VAULT</h2>

                    <h3 style={{ fontFamily: "'Kaushan Script', cursive", color: '#8B0000', fontSize: '2rem', margin: '0 0 1rem 0' }}>GATE 1: Foundation ({gate1Questions.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                        {gate1Questions.map(q => (
                            <div key={q.id} style={{ backgroundColor: 'transparent', padding: '1.5rem', border: '3px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '8px solid #8B0000' }}>
                                <div><strong style={{ fontSize: '1.3rem' }}>{q.title}</strong><br /><span style={{ color: '#666' }}>{q.text.substring(0, 60)}...</span></div>
                                <button onClick={() => handleDelete(q.id)} style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Courier New', monospace" }}>DELETE</button>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontFamily: "'Kaushan Script', cursive", color: '#8B0000', fontSize: '2rem', margin: '0 0 1rem 0' }}>GATE 2: Advanced ({gate2Questions.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {gate2Questions.map(q => (
                            <div key={q.id} style={{ backgroundColor: 'transparent', padding: '1.5rem', border: '3px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '8px solid #111' }}>
                                <div><strong style={{ fontSize: '1.3rem' }}>{q.title}</strong><br /><span style={{ color: '#666' }}>{q.text.substring(0, 60)}...</span></div>
                                <button onClick={() => handleDelete(q.id)} style={{ backgroundColor: '#8B0000', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Courier New', monospace" }}>DELETE</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}