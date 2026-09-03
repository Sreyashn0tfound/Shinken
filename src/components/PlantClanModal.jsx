import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function PlantClanModal({ onClose }) {
    const [clanName, setClanName] = useState('');
    // Look mom, no Captain Name state!
    const [generatedCode, setGeneratedCode] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const createClanMutation = useMutation(api.clans.createClan);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clanName) return;

        setIsLoading(true);
        setErrorMsg('');

        try {
            // 🚨 THE FIX: The backend expects "name", so we map clanName to name! 
            const result = await createClanMutation({ name: clanName });

            localStorage.setItem("ikya_player_id", result.playerId);
            localStorage.setItem("ikya_clan_id", result.clanId);

            setGeneratedCode(result.joinCode);
        } catch (error) {
            console.error("Failed to plant clan:", error);
            // Catching specific Convex auth errors
            setErrorMsg(error.message.includes("Uncaught Error:") ? error.message.split("Uncaught Error: ")[1] : "Failed to connect to the database.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center',
            pointerEvents: 'auto'
        }}>

            <div style={{
                backgroundColor: '#f5fff6', backgroundImage: 'url("/paper.png")',
                padding: '3rem', border: '4px solid #111', boxShadow: '12px 12px 0px #8B0000',
                width: '400px', textAlign: 'center', position: 'relative'
            }}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '-20px', right: '-20px', backgroundColor: '#111',
                    color: '#fff', border: 'none', width: '40px', height: '40px', fontSize: '1.5rem',
                    cursor: 'pointer', fontFamily: "'Shojumaru', cursive"
                }}>X</button>

                {!generatedCode ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#8B0000' }}>FORGE A CLAN</h2>

                        <input
                            placeholder="Clan Name" value={clanName} onChange={(e) => setClanName(e.target.value)}
                            style={{ padding: '1rem', fontSize: '1.2rem', border: '2px solid #111', backgroundColor: 'transparent', fontFamily: "'Kaushan Script', cursive" }}
                            required
                        />

                        {/* Completely removed the Captain's Name input field! */}

                        {errorMsg && <p style={{ color: 'red', margin: 0, fontWeight: 'bold' }}>{errorMsg}</p>}

                        <button type="submit" className="ink-button primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? "FORGING..." : "PLANT THE SEED"}
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#111' }}>CLAN FORGED</h2>
                        <p style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '1.2rem', margin: 0 }}>
                            Share this code with your 3 teammates:
                        </p>
                        <div style={{
                            backgroundColor: '#8B0000', color: '#fff', padding: '1.5rem',
                            fontSize: '3rem', fontWeight: 'bold', border: '4px solid #111', letterSpacing: '8px'
                        }}>
                            {generatedCode}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Waiting for members to join...</p>
                    </div>
                )}

            </div>
        </div>
    );
}