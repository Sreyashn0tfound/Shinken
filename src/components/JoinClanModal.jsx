import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function JoinClanModal({ onClose }) {
    // Look mom, no Player Name state! Google handles it.
    const [joinCode, setJoinCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const joinClanMutation = useMutation(api.clans.joinClan);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!joinCode) return;

        setIsLoading(true);
        setErrorMsg('');

        try {
            // We only send the joinCode now!
            const result = await joinClanMutation({ joinCode });

            // Keep saving IDs to local storage so the frontend knows what lobby to show
            localStorage.setItem("ikya_player_id", result.playerId);
            localStorage.setItem("ikya_clan_id", result.clanId);

            setIsSuccess(true);

            // We will redirect them to the Lobby page from here later!

        } catch (error) {
            // Convex errors come back as strings, we format it so the user can read it
            setErrorMsg(error.message.includes("Uncaught Error:") ? error.message.split("Uncaught Error: ")[1] : "Failed to join clan.");
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
                padding: '3rem', border: '4px solid #111', boxShadow: '12px 12px 0px #FF69B4',
                width: '400px', textAlign: 'center', position: 'relative'
            }}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '-20px', right: '-20px', backgroundColor: '#111',
                    color: '#fff', border: 'none', width: '40px', height: '40px', fontSize: '1.5rem',
                    cursor: 'pointer', fontFamily: "'Shojumaru', cursive"
                }}>X</button>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#111' }}>JOIN THE BLOOM</h2>

                        {/* We completely removed the Player Name input box! */}

                        <input
                            placeholder="4-Digit Clan Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                            style={{ padding: '1rem', fontSize: '1.2rem', border: '2px solid #111', backgroundColor: 'transparent', fontFamily: "'Kaushan Script', cursive", textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}
                            maxLength={4} required
                        />

                        {errorMsg && <p style={{ color: 'red', margin: 0, fontWeight: 'bold' }}>{errorMsg}</p>}

                        <button type="submit" className="ink-button" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? "CONNECTING..." : "SWEAR LOYALTY"}
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontFamily: "'Shojumaru', cursive", margin: 0, color: '#8B0000' }}>OATH ACCEPTED</h2>
                        <p style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '1.2rem', margin: 0 }}>
                            You are now in the lobby. Awaiting your Captain's orders.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}