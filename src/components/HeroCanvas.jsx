import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Center, OrbitControls } from '@react-three/drei';
import { SignedIn, SignedOut, SignIn, UserButton } from "@clerk/clerk-react";
import { shogunApi } from '../api'; // 🚨 OUR NEW EXPRESS BRIDGE

import SakuraModel from './SakuraModel';
import FallingSakura from './FallingSakura';
import EnterArenaModal from './EnterArenaModal'; 
import Lobby from './Lobby';
import QuizArena from './QuizArena';
import TeacherDashboard from './TeacherDashboard';

export default function HeroCanvas() {
    const [forceTeacherDashboard, setForceTeacherDashboard] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lobbyData, setLobbyData] = useState(null);

    // 🚨 Polling the Express server every 3 seconds if logged in
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
        const interval = setInterval(fetchLobby, 3000); 
        return () => clearInterval(interval);
    }, []);

    const handleTeacherLogin = () => {
        const password = window.prompt("Enter the Shogun's Seal (Password):");
        if (password === "BLOOM_2026") {
            setForceTeacherDashboard(true);
        } else if (password !== null) {
            alert("⚔️ Access Denied. Incorrect password.");
        }
    };

    if (forceTeacherDashboard) return <TeacherDashboard />;

    // --- THE UNIFIED RADAR ---
    if (lobbyData?.clan) {
        const status = lobbyData.clan.status;
        const arenaStates = ["active", "gate_1_complete", "active_gate_2", "eliminated", "tournament_complete"];

        if (arenaStates.includes(status)) return <QuizArena />;
        if (status === "waiting_in_lobby") return <Lobby />;
    }

    // --- THE HOMEPAGE ---
    return (
        <div style={{ 
            width: '100vw', 
            minHeight: '100vh', 
            position: 'relative',
            backgroundColor: '#f5fff6',
            backgroundImage: `
                linear-gradient(rgba(245, 255, 246, 0.1), rgba(245, 255, 246, 0.4)),
                url("/ChatGPT Image Sep 2, 2026, 09_41_42 PM.png")
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflowX: 'hidden',
            overflowY: 'auto',
        }}>
            <FallingSakura />

            <button
                onClick={handleTeacherLogin}
                style={{
                    position: 'absolute', top: '20px', left: '20px', zIndex: 9999,
                    backgroundColor: '#8B0000', color: '#FFF', border: '3px solid #111',
                    padding: '10px 20px', fontWeight: 'bold', fontFamily: "'Shojumaru', cursive",
                    cursor: 'pointer', boxShadow: '4px 4px 0px #111'
                }}
            >
                🚨 SHOGUN COMMAND
            </button>

            {/* Floating Kanji for SHIN (True) and KEN (Sword) */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 1, pointerEvents: 'none', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                padding: '0 4vw', opacity: 0.08, userSelect: 'none'
            }}>
                <span style={{ fontSize: '45vh', color: '#8B0000', fontWeight: '900', transform: 'rotate(-5deg)' }}>真</span>
                <span style={{ fontSize: '45vh', color: '#8B0000', fontWeight: '900', transform: 'rotate(5deg)' }}>剣</span>
            </div>

            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
                <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <Environment preset="city" />
                    <Suspense fallback={null}>
                        <Center><SakuraModel /></Center>
                    </Suspense>
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
                </Canvas>
            </div>

            <div style={{
                position: 'relative', zIndex: 3, pointerEvents: 'none',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', alignItems: 'center',
                minHeight: '100vh',
                padding: '15vh 1rem 10vh 1rem'
            }}>
                <div style={{ textAlign: 'center', textShadow: '0px 4px 15px rgba(255,255,255,0.9)' }}>
                    {/* The h1 text is visually hidden since it is painted on your background image */}
                    <h1 style={{ display: 'none' }}>SHINKEN</h1>
                    
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '2.2rem', fontFamily: "'Kaushan Script', cursive", letterSpacing: '12px', color: '#111', textShadow: '2px 2px 0px #fff, -1px -1px 0px #fff' }}>
                        THE IRON TRIALS
                    </p>
                </div>

                <SignedOut>
                    <div style={{ pointerEvents: 'auto', transform: 'scale(0.9)' }}>
                        <SignIn routing="hash" />
                    </div>
                </SignedOut>

                <SignedIn>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', pointerEvents: 'auto' }}>
                        <button className="ink-button primary" onClick={() => setIsModalOpen(true)}>
                            ENTER THE ARENA
                        </button>
                        <div style={{ backgroundColor: '#f5fff6', padding: '4px', borderRadius: '50%', border: '3px solid #111', boxShadow: '4px 4px 0px #111', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </SignedIn>
            </div>

            {isModalOpen && (
                <EnterArenaModal 
                    onClose={() => setIsModalOpen(false)} 
                    onJoinSuccess={() => window.location.reload()} 
                />
            )}
        </div>
    );
}