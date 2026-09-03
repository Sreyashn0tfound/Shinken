import { useState, useEffect } from 'react';
import { shogunApi } from '../api'; // 🚨 The new Express Bridge
import FallingSakura from './FallingSakura';

export default function Lobby() {
    const [lobbyData, setLobbyData] = useState(null);
    const [newName, setNewName] = useState("");

    // 🚨 REPLACING CONVEX: Poll the Express server every 2 seconds
    useEffect(() => {
        const playerId = localStorage.getItem("ikya_player_id");
        if (!playerId) return;

        const fetchLobby = async () => {
            try {
                const data = await shogunApi.getMyLobby(playerId);
                setLobbyData(data);
            } catch (error) {
                console.error("Lobby check failed.");
            }
        };

        fetchLobby(); // Initial fetch
        const interval = setInterval(fetchLobby, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!lobbyData) return null;

    const { clan, players, session } = lobbyData;
    // If it's a solo session, we only need 1 slot. Otherwise 4.
    const maxPlayers = session?.mode === 'solo' ? 1 : 4;
    const slots = Array.from({ length: maxPlayers });

    const handleLeave = async () => {
        if (window.confirm("Are you sure you want to abandon your position?")) {
            // Depending on how you want to handle leaving in the new backend,
            // you might want to call a new shogunApi.leaveClan() here later.
            // For now, we clear local storage and reload to kick them to the homepage.
            localStorage.removeItem("ikya_player_id");
            localStorage.removeItem("ikya_clan_id");
            window.location.reload();
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        if (players.length >= maxPlayers) return alert("Roster is full!");

        // This would connect to a new Express route if you keep the "add teammate manually" feature
        // await shogunApi.addTeammate({ clanId: clan.id, name: newName });
        
        alert("Teammate feature requires backend route update. Use 'Join Clan' with code for now!");
        setNewName("");
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#f5fff6',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
            zIndex: 100, display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start', alignItems: 'center', padding: '4rem 2rem',
            overflowY: 'auto'
        }}>

            <FallingSakura />

            <span style={{
                position: 'fixed', fontSize: '40vw', color: '#8B0000',
                opacity: 0.03, zIndex: 0, pointerEvents: 'none', userSelect: 'none',
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
            }}>待</span>

            <div style={{ zIndex: 1, textAlign: 'center', width: '100%', maxWidth: '900px' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '1.5rem', color: '#666', margin: '0 0 -0.5rem 0', letterSpacing: '4px' }}>
                        OFFICIAL ROSTER OF CLAN
                    </p>
                    <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '5rem', color: '#8B0000', margin: 0, textTransform: 'uppercase', textShadow: '3px 3px 0px #111' }}>
                        {clan?.name || "THE NAMELESS BLOOM"}
                    </h1>
                </div>

                {/* --- THE NEW ADD TEAMMATE FORM (Hidden if Solo mode) --- */}
                {session?.mode !== 'solo' && players.length < maxPlayers ? (
                    <form onSubmit={handleAdd} style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', padding: '1.5rem', border: '3px dashed #8B0000', display: 'inline-flex' }}>
                        <input
                            type="text"
                            placeholder="Enter Teammate's Name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            style={{ padding: '1rem', fontSize: '1.2rem', fontFamily: "'Courier New', monospace", border: '3px solid #111', width: '300px', backgroundColor: 'transparent', fontWeight: 'bold' }}
                            
                        />
                        <button type="submit" style={{ padding: '0 2rem', backgroundColor: '#8B0000', color: '#fff', fontSize: '1.2rem', fontFamily: "'Shojumaru', cursive", border: '3px solid #111', cursor: 'pointer', boxShadow: '4px 4px 0px #111' }}>
                            ADD TO ROSTER
                        </button>
                    </form>
                ) : (
                    session?.mode !== 'solo' && (
                        <div style={{ marginBottom: '3rem', padding: '1rem', backgroundColor: '#111', color: '#FF4500', border: '3px solid #FF4500', display: 'inline-block', fontFamily: "'Shojumaru', cursive", fontSize: '1.5rem' }}>
                            ROSTER FULL. PREPARE FOR BATTLE.
                        </div>
                    )
                )}

                {/* THE LIVE ROSTER (Dynamic Slots) */}
                <div style={{ display: 'grid', gridTemplateColumns: session?.mode === 'solo' ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                    {slots.map((_, index) => {
                        const player = players[index];
                        return (
                            <div key={index} style={{
                                border: '3px solid #111', padding: '1.2rem',
                                backgroundColor: player ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.02)',
                                borderStyle: player ? 'solid' : 'dashed',
                                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem',
                                boxShadow: player ? '4px 4px 0px #111' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {player ? (
                                    <>
                                        <span style={{ fontSize: '1.8rem' }}>{player.role === 'captain' || session?.mode === 'solo' ? '👑' : '⚔️'}</span>
                                        <span style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '1.5rem', fontWeight: 'bold', color: '#111' }}>
                                            {player.name}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ fontFamily: "'Kaushan Script', cursive", fontSize: '1.2rem', color: '#888' }}>
                                        Awaiting Samurai...
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div style={{ border: '2px dashed #8B0000', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '2rem', textAlign: 'left', marginBottom: '3rem', boxShadow: '8px 8px 0px rgba(139, 0, 0, 0.15)' }}>
                    <h3 style={{ fontFamily: "'Shojumaru', cursive", color: '#8B0000', margin: '0 0 1.5rem 0', fontSize: '1.8rem', textAlign: 'center', textDecoration: 'underline', textUnderlineOffset: '8px' }}>
                        RULES OF THE TRIALS
                    </h3>
                    <ul style={{ fontFamily: "'Courier New', monospace", fontWeight: 'bold', color: '#111', lineHeight: '2', margin: 0, paddingLeft: '1.5rem', fontSize: '1.1rem' }}>
                        {session?.mode === 'group' && (
                            <li style={{ marginBottom: '1rem' }}><strong style={{ color: '#8B0000', fontSize: '1.2rem' }}>I. THE COLLECTIVE STRIKE:</strong> Every samurai fights. The Clan's final score is the combined sum of every member's accuracy AND speed.</li>
                        )}
                        <li style={{ marginBottom: '1rem' }}><strong style={{ color: '#8B0000', fontSize: '1.2rem' }}>II. THE DISHONOR SYSTEM:</strong> Fullscreen is mandatory. Two strikes for tabbing out or cheating, and YOU are banished. Your clan survives, but fights a man down.</li>
                        <li style={{ marginBottom: '1rem' }}><strong style={{ color: '#8B0000', fontSize: '1.2rem' }}>III. GATE 1 - FOUNDATION:</strong> 30 Mins. 30 Questions. Core CS concepts. Your Clan must cross the point threshold to survive.</li>
                        <li><strong style={{ color: '#8B0000', fontSize: '1.2rem' }}>IV. GATE 2 - ADVANCED:</strong> 45 Mins. 30 Questions. GATE-level deep tech. Only the top TWO clans will emerge victorious.</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingBottom: '3rem' }}>
                    <h2 style={{ fontFamily: "'Shojumaru', cursive", color: '#8B0000', fontSize: '2rem', animation: 'pulse 2s infinite', margin: 0, backgroundColor: 'rgba(255,255,255,0.7)', padding: '1rem 2rem', borderRadius: '50px' }}>
                        AWAITING TEACHER'S SIGNAL...
                    </h2>
                    <button onClick={handleLeave} style={{ backgroundColor: 'transparent', border: 'none', color: '#666', textDecoration: 'underline', fontFamily: "'Kaushan Script', cursive", fontSize: '1.2rem', cursor: 'pointer' }}>
                        Abandon Position
                    </button>
                </div>
            </div>

            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 1; box-shadow: 0 0 15px rgba(139,0,0,0.2); }
                    50% { opacity: 0.5; box-shadow: 0 0 0px rgba(139,0,0,0); }
                    100% { opacity: 1; box-shadow: 0 0 15px rgba(139,0,0,0.2); }
                }
                `}
            </style>
        </div>
    );
}