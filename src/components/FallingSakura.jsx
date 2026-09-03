import { useEffect, useState } from 'react';

export default function FallingSakura() {
    const [petals, setPetals] = useState([]);

    useEffect(() => {
        // Generate 30 random petals
        const newPetals = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}vw`, // Random horizontal start
            animationDuration: `${Math.random() * 5 + 5}s`, // Random fall speed (5-10s)
            animationDelay: `-${Math.random() * 5}s`, // Random start time so they don't fall in a straight line
            width: `${Math.random() * 10 + 10}px`, // Random size
            height: `${Math.random() * 10 + 15}px`,
        }));
        setPetals(newPetals);
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="petal"
                    style={{
                        left: petal.left,
                        width: petal.width,
                        height: petal.height,
                        animation: `fall ${petal.animationDuration} linear infinite, sway 3s ease-in-out infinite alternate`,
                        animationDelay: petal.animationDelay,
                    }}
                />
            ))}
        </div>
    );
}