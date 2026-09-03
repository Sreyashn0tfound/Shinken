import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { shogunApi } from '../api';

export default function EnterArenaModal({ onClose, onJoinSuccess }) {
    const { user } = useUser();
    const [step, setStep] = useState('auth'); 
    
    // 🚨 NEW CREDENTIAL STATES
    const [playerName, setPlayerName] = useState('');
    const [usn, setUsn] = useState('');
    const [sessionPin, setSessionPin] = useState('');
    const [clanName, setClanName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleVerifyPin = async (e) => {
        e.preventDefault();
        if (!playerName || !usn || !sessionPin) return setErrorMsg("All fields are required.");
        
        setIsLoading(true);
        setErrorMsg('');

        try {
            const data = await shogunApi.verifySession(sessionPin);

            if (data.session.mode === 'solo') {
                const result = await shogunApi.joinSolo({
                    sessionPin, clerkId: user.id, playerName, usn 
                });
                localStorage.setItem("ikya_player_id", result.player.id);
                localStorage.setItem("ikya_clan_id", result.clan.id);
                onJoinSuccess();
            } else {
                setStep('group_choice');
            }
        } catch (error) {
            setErrorMsg("Invalid or inactive Session PIN.");
        } finally { setIsLoading(false); }
    };

    const handleForgeClan = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await shogunApi.forgeClan({ sessionPin, clerkId: user.id, playerName, usn, clanName });
            localStorage.setItem("ikya_player_id", result.player.id);
            localStorage.setItem("ikya_clan_id", result.clan.id);
            onJoinSuccess();
        } catch (error) { setErrorMsg("Failed to forge clan."); } 
        finally { setIsLoading(false); }
    };

    // ... (Keep the joinClan logic exactly the same, but pass `usn` and `playerName` if needed)

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f5fff6', padding: '3rem', border: '4px solid #111', width: '400px', textAlign: 'center', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '-20px', right: '-20px', backgroundColor: '#111', color: '#fff', border: 'none', width: '40px', height: '40px', cursor: 'pointer' }}>X</button>

                {errorMsg && <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMsg}</p>}

                {step === 'auth' && (
                    <form onSubmit={handleVerifyPin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#8B0000' }}>ENTER ARENA</h2>
                        <input placeholder="Full Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} style={{ padding: '1rem', border: '2px solid #111' }} required />
                        <input placeholder="USN" value={usn} onChange={(e) => setUsn(e.target.value)} style={{ padding: '1rem', border: '2px solid #111', textTransform: 'uppercase' }} required />
                        <input placeholder="Session PIN" value={sessionPin} onChange={(e) => setSessionPin(e.target.value)} style={{ padding: '1rem', border: '2px solid #111', letterSpacing: '2px' }} required />
                        <button type="submit" className="ink-button primary" disabled={isLoading}>{isLoading ? "LOCATING..." : "VERIFY"}</button>
                    </form>
                )}

                {/* Keep Group Choice and Forge Views exactly the same, they will naturally use the new playerName and usn variables */}
                {step === 'group_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#111' }}>GROUP COMBAT</h2>
                        <button onClick={() => setStep('forge')} className="ink-button primary">FORGE NEW CLAN</button>
                        <button onClick={() => setStep('join')} className="ink-button">JOIN EXISTING CLAN</button>
                    </div>
                )}
                {step === 'forge' && (
                    <form onSubmit={handleForgeClan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#8B0000' }}>NAME YOUR CLAN</h2>
                        <input placeholder="Clan Name" value={clanName} onChange={(e) => setClanName(e.target.value)} style={{ padding: '1rem', fontSize: '1.2rem', border: '2px solid #111' }} required />
                        <button type="submit" className="ink-button primary" disabled={isLoading}>PLANT THE SEED</button>
                    </form>
                )}
            </div>
        </div>
    );
}