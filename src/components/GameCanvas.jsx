import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fairy from './Fairy';
import Gem from './Gem';
import './GameCanvas.css';

const GameCanvas = ({ score, setScore, energyDuration, resetTrigger }) => {
    const containerRef = useRef(null);
    const [fairies, setFairies] = useState([]);
    const [gems, setGems] = useState([]);
    const requestRef = useRef();
    const previousTimeRef = useRef();

    // Sounds
    const plopSound = useRef(new Audio('/sounds/plop.mp3'));

    // Helpers
    const rand = (min, max) => Math.random() * (max - min) + min;

    // Initialize Game
    useEffect(() => {
        setFairies([]);
        setGems([]);

        spawnFairy();
        const t = setTimeout(spawnGem, 100);

        const gemInterval = setInterval(spawnGem, 2000);

        return () => {
            clearTimeout(t);
            clearInterval(gemInterval);
        };
    }, [resetTrigger]);

    // Add fairy based on score
    useEffect(() => {
        const targetFairies = Math.floor(score / 100) + 1;
        if (fairies.length < targetFairies) {
            spawnFairy();
        }
    }, [score]);

    const spawnFairy = () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;

        // Randomize Variant
        const r = Math.random();
        let variant = 'standard';
        let speedMult = 1;
        let energyMult = 1;

        if (r > 0.7) {
            variant = 'swift';
            speedMult = 1.5;
        } else if (r > 0.4) {
            variant = 'durable';
            energyMult = 1.5;
        }

        const newFairy = {
            id: Date.now() + Math.random(),
            x: clientWidth / 2 - 48 + rand(-20, 20),
            y: clientHeight * 0.7 - 48 + rand(-20, 20),
            dx: 0,
            dy: 0,
            energy: energyDuration * 60 * 1000 * energyMult,
            maxEnergy: energyDuration * 60 * 1000 * energyMult,
            state: 'idle',
            variant,
            speedMult
        };
        setFairies(prev => [...prev, newFairy]);
    };

    const spawnGem = () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;

        // Randomize Type
        const r = Math.random();
        let type = 'common';
        if (r > 0.98) type = 'legendary';
        else if (r > 0.85) type = 'rare';

        const newGem = {
            id: Date.now() + Math.random(),
            x: rand(0, clientWidth - 64),
            y: rand(0, clientHeight - 64),
            type
        };
        setGems(prev => [...prev, newGem]);
    };

    // Sync refs with state
    useEffect(() => {
        // Only update ref from state if we are NOT dragging that specific fairy
        // or if it's a non-positional update (like energy).
        // Actually, simpler: Just keep them in sync, but handleDrag will update Ref directly.
        fairiesRef.current = fairies.map(f => {
            const existing = fairiesRef.current.find(refF => refF.id === f.id);
            // If currently dragging, keep the ref's position (which is being updated by drag)
            // Otherwise take the state's position (wandering)
            if (existing && existing.state === 'dragging') {
                return { ...f, x: existing.x, y: existing.y };
            }
            return f;
        });
    }, [fairies]);

    const fairiesRef = useRef([]);

    // Game Loop
    const animate = useCallback((time) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;

            setFairies(prevFairies => {
                return prevFairies.map(fairy => {
                    // If dragging, don't update position via physics, just energy
                    if (fairy.state === 'dragging') {
                        const newEnergy = fairy.energy - deltaTime;
                        return { ...fairy, energy: newEnergy };
                    }

                    let { x, y, dx, dy, state, energy, speedMult } = fairy;

                    const newEnergy = energy - deltaTime;
                    if (newEnergy <= 0 && prevFairies.length > 1) {
                        return null;
                    }

                    if (state === 'wandering') {
                        x += dx * (deltaTime / 16);
                        y += dy * (deltaTime / 16);

                        if (containerRef.current) {
                            const { clientWidth, clientHeight } = containerRef.current;
                            if (x < 0 || x > clientWidth - 96) dx = -dx;
                            if (y < 0 || y > clientHeight - 96) dy = -dy;
                        }
                    } else if (state === 'idle' && Math.random() < 0.01) {
                        state = 'wandering';
                        const angle = rand(0, Math.PI * 2);
                        const speed = 2 * (speedMult || 1);
                        dx = Math.cos(angle) * speed;
                        dy = Math.sin(angle) * speed;
                    } else if (state === 'wandering' && Math.random() < 0.01) {
                        state = 'idle';
                    }

                    return { ...fairy, x, y, dx, dy, state, energy: newEnergy };
                }).filter(Boolean);
            });
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [energyDuration]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [animate]);

    // Collision Check (Runs on interval or every frame? Let's do every frame in a separate effect or just use the ref)
    // Actually, let's put it in a useFrame loop or just a fast interval.
    // Since we have an animation loop, we could do it there, but separating is fine.
    useEffect(() => {
        const checkCollision = () => {
            // Use REF for positions to get real-time drag updates
            for (const fairy of fairiesRef.current) {
                const r1 = { x: fairy.x, y: fairy.y, w: 96, h: 96 };
                for (const gem of gems) {
                    const r2 = { x: gem.x, y: gem.y, w: 64, h: 64 };
                    if (r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
                        r1.y < r2.y + r2.h && r1.y + r1.h > r2.y) {
                        return gem;
                    }
                }
            }
            return null;
        };

        const interval = setInterval(() => {
            const collectedGem = checkCollision();

            if (collectedGem) {
                setGems(prev => prev.filter(g => g.id !== collectedGem.id));

                // Scoring
                let points = 1;
                if (collectedGem.type === 'rare') points = 5;
                if (collectedGem.type === 'legendary') points = 10;
                setScore(s => s + points);

                // Audio
                plopSound.current.currentTime = 0;
                plopSound.current.playbackRate = 1 + (points - 1) * 0.1;
                plopSound.current.play().catch(e => { });
            }
        }, 50); // Check every 50ms

        return () => clearInterval(interval);
    }, [gems, setScore]); // removed fairies dependency


    const handleFairyDrag = (id, x, y) => {
        // Update REF only, do not trigger re-render
        const idx = fairiesRef.current.findIndex(f => f.id === id);
        if (idx !== -1) {
            fairiesRef.current[idx].x = x;
            fairiesRef.current[idx].y = y;
            fairiesRef.current[idx].state = 'dragging';
        }

        // We DO need to set state to 'dragging' initially so the physics loop ignores it
        // But we don't need to update x/y in state constantly.
        setFairies(prev => {
            const f = prev.find(p => p.id === id);
            if (f && f.state !== 'dragging') {
                return prev.map(p => p.id === id ? { ...p, state: 'dragging' } : p);
            }
            return prev;
        });
    };

    const handleFairyDrop = (id) => {
        // Sync final position from Ref to State
        const refFairy = fairiesRef.current.find(f => f.id === id);
        if (refFairy) {
            setFairies(prev => prev.map(f =>
                f.id === id ? { ...f, x: refFairy.x, y: refFairy.y, state: 'idle' } : f
            ));
        }
    };

    return (
        <div className="game-canvas" ref={containerRef}>
            {gems.map(gem => (
                <Gem key={gem.id} x={gem.x} y={gem.y} type={gem.type} />
            ))}
            {fairies.map(fairy => (
                <Fairy
                    key={fairy.id}
                    {...fairy}
                    onDrag={handleFairyDrag}
                    onDrop={handleFairyDrop}
                />
            ))}
        </div>
    );
};

export default GameCanvas;
