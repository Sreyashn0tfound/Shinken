import { useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { shogunApi } from '../api';
import FallingSakura from './FallingSakura';

const API_URL = "http://localhost:3001/api";

export default function ExamForge({ onBack }) {
    const { user } = useUser();

    const [examTitle, setExamTitle] = useState("");
    const [sectionRules, setSectionRules] = useState("Divide into 3 sections.");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [rawText, setRawText] = useState("");

    const [isParsing, setIsParsing] = useState(false);
    const [parsedExam, setParsedExam] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) setUploadedFile(file);
    };

    const handleParse = async (e) => {
        e.preventDefault();
        if (!uploadedFile && !rawText.trim()) return alert("Please upload a PDF or paste raw text!");
        if (!examTitle.trim()) return alert("Exam Title is required!");

        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append('sectionRules', sectionRules);
            if (uploadedFile) {
                formData.append('file', uploadedFile);
            } else {
                formData.append('rawText', rawText);
            }

            const res = await fetch(`${API_URL}/ai/parse`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Parse failed');
            }

            const data = await res.json();
            setParsedExam(data.sections);
        } catch (error) {
            alert("Failed to parse document: " + error.message);
        } finally {
            setIsParsing(false);
        }
    };

    const handleSaveExam = async () => {
        if (!parsedExam || !user) return;
        try {
            await shogunApi.saveAIExam({
                teacherId: user.id,
                title: examTitle,
                sections: parsedExam
            });
            alert("⚔️ EXAM SECURED! The scroll has been locked into the Iron Vault.");
            onBack();
        } catch (error) {
            alert("Vault Error: " + error.message);
        }
    };

    return (
        <div style={{
            height: '100vh', width: '100%', boxSizing: 'border-box',
            backgroundColor: '#f5fff6',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
            padding: '4rem 2rem', fontFamily: "'Courier New', monospace", color: '#111',
            position: 'relative', overflowY: 'auto'
        }}>
            <FallingSakura />

            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #8B0000', paddingBottom: '1rem', marginBottom: '3rem' }}>
                    <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '3rem', color: '#111', margin: 0 }}>
                        THE EXAM FORGE
                    </h1>
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: '#8B0000', border: '3px solid #8B0000', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        BACK TO COMMAND
                    </button>
                </div>

                {!parsedExam ? (
                    <form onSubmit={handleParse} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '3rem', border: '4px solid #111', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)' }}>

                        {/* Info box */}
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fff8e1', border: '3px solid #f9a825' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
                                📄 Upload a PDF with numbered questions (1. 2. 3.) and options labeled A) B) C) D).
                                Include an <strong>Answer Key</strong> section at the end for automatic correct answer detection.
                            </p>
                        </div>

                        <input
                            type="text" placeholder="Exam Title (e.g., Computer Networks Midterm)"
                            value={examTitle} onChange={(e) => setExamTitle(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', fontSize: '1.2rem', border: '3px solid #111', marginBottom: '1.5rem', fontWeight: 'bold' }}
                            required
                        />

                        <input
                            type="text" placeholder="Section Rules (e.g., Divide into 3 sections)"
                            value={sectionRules} onChange={(e) => setSectionRules(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', fontSize: '1.2rem', border: '3px solid #111', marginBottom: '1.5rem' }}
                        />

                        <div style={{ marginBottom: '2rem', padding: '2rem', border: '3px dashed #111', backgroundColor: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                            <label style={{ color: '#111', fontSize: '1.2rem', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>Upload PDF:</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                style={{ fontSize: '1.1rem', fontFamily: "'Courier New', monospace" }}
                            />
                            {uploadedFile && <p style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: '1rem' }}>✅ Attached: {uploadedFile.name}</p>}
                        </div>

                        <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '1rem 0', fontSize: '1.2rem' }}>OR PASTE TEXT MANUALLY</p>

                        <textarea
                            placeholder="Paste exam text here if you don't have a PDF..."
                            value={rawText} onChange={(e) => setRawText(e.target.value)}
                            rows="6"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', fontSize: '1.1rem', border: '3px solid #111', marginBottom: '2rem' }}
                        />

                        <button type="submit" disabled={isParsing} style={{ width: '100%', backgroundColor: '#111', color: '#fff', padding: '1.5rem', fontSize: '1.8rem', fontFamily: "'Shojumaru', cursive", border: '4px solid #111', cursor: 'pointer', boxShadow: '6px 6px 0px #8B0000' }}>
                            {isParsing ? "PARSING DOCUMENT..." : "FORGE EXAM FROM PDF"}
                        </button>
                    </form>
                ) : (
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '3rem', border: '4px solid #111', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)' }}>
                        <h2 style={{ fontFamily: "'Kaushan Script', cursive", color: '#8B0000', fontSize: '2.5rem', marginTop: 0 }}>Step 2: Review Exam Structure</h2>
                        <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '2rem', marginBottom: '2rem' }}>{examTitle}</h1>

                        {parsedExam.map((section, sIdx) => (
                            <div key={sIdx} style={{ marginBottom: '3rem', border: '3px dashed #8B0000', padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.8rem', color: '#8B0000', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', marginTop: 0 }}>
                                    {section.sectionTitle}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                                    {section.questions.map((q, qIdx) => (
                                        <div key={qIdx} style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', border: '2px solid #111' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 1rem 0' }}>Q{qIdx + 1}: {q.questionText}</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} style={{ padding: '0.5rem', backgroundColor: q.correctAnswer === opt ? '#e8f5e9' : 'transparent', border: q.correctAnswer === opt ? '2px solid #2e7d32' : '1px solid #ccc' }}>
                                                        {opt} {q.correctAnswer === opt && "✅"}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setParsedExam(null)} style={{ flex: 1, backgroundColor: 'transparent', color: '#111', padding: '1.5rem', fontSize: '1.5rem', fontFamily: "'Shojumaru', cursive", border: '4px solid #111', cursor: 'pointer' }}>
                                DISCARD & RESTART
                            </button>
                            <button onClick={handleSaveExam} style={{ flex: 2, backgroundColor: '#2e7d32', color: '#fff', padding: '1.5rem', fontSize: '1.5rem', fontFamily: "'Shojumaru', cursive", border: '4px solid #111', cursor: 'pointer', boxShadow: '6px 6px 0px #111' }}>
                                LOCK EXAM INTO DATABASE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
