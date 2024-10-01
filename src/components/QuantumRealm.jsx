import React, { useState, useEffect, useCallback } from "react";
import "../styles/QuantumRealm.css";

const particleTypes = ["bubble", "comet", "asteroid"];
const difficultyLevels = ["Easy", "Medium", "Hard"];

const QuantumRealm = () => {
  const [particles, setParticles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState("Medium");
  const [showLevelSelect, setShowLevelSelect] = useState(true);

  const generateParticles = useCallback(() => {
    const difficultyMultiplier =
      difficulty === "Easy" ? 0.7 : difficulty === "Hard" ? 1.3 : 1;
    const particleCount = Math.floor(20 * difficultyMultiplier);

    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const type =
        particleTypes[Math.floor(Math.random() * particleTypes.length)];
      const size =
        type === "bubble"
          ? Math.random() * 20 + 10
          : type === "comet"
          ? Math.random() * 30 + 20
          : Math.random() * 40 + 30; // asteroid

      newParticles.push({
        id: i,
        type,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        color:
          type === "bubble"
            ? `hsla(${Math.random() * 360}, 100%, 50%, 0.6)`
            : type === "comet"
            ? `hsl(${Math.random() * 60 + 200}, 100%, 70%)`
            : `hsl(${Math.random() * 60}, 70%, 40%)`,
        points: type === "bubble" ? 1 : type === "comet" ? 3 : 5,
        vx:
          (Math.random() - 0.5) *
          level *
          (type === "comet" ? 2 : 1) *
          difficultyMultiplier,
        vy:
          (Math.random() - 0.5) *
          level *
          (type === "comet" ? 2 : 1) *
          difficultyMultiplier,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5 * difficultyMultiplier,
      });
    }
    setParticles(newParticles);
  }, [level, difficulty]);

  useEffect(() => {
    generateParticles();
    window.addEventListener("resize", generateParticles);

    return () => {
      window.removeEventListener("resize", generateParticles);
    };
  }, [generateParticles]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
      setShowLevelSelect(true);
    }
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (gameActive) {
      const moveParticles = () => {
        setParticles((prevParticles) =>
          prevParticles.map((particle) => {
            let newX = particle.x + particle.vx;
            let newY = particle.y + particle.vy;
            let newRotation = particle.rotation + particle.rotationSpeed;

            // Wrap around screen
            if (newX < 0) newX = window.innerWidth;
            if (newX > window.innerWidth) newX = 0;
            if (newY < 0) newY = window.innerHeight;
            if (newY > window.innerHeight) newY = 0;

            return { ...particle, x: newX, y: newY, rotation: newRotation };
          })
        );
      };

      const animationId = requestAnimationFrame(moveParticles);
      return () => cancelAnimationFrame(animationId);
    }
  }, [gameActive, particles]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setLevel(1);
    setShowLevelSelect(false);
    generateParticles();
  };

  const catchParticle = (id, points) => {
    if (!gameActive) return;

    setScore((prevScore) => {
      const newScore = prevScore + points;
      if (newScore % 50 === 0) {
        setLevel((prevLevel) => prevLevel + 1);
      }
      return newScore;
    });

    setParticles((prevParticles) =>
      prevParticles.filter((particle) => particle.id !== id)
    );

    if (particles.length === 1) {
      generateParticles();
    }
  };

  return (
    <div className="quantum-realm">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="clouds"></div>

      <h1>Quantum Particle Catcher</h1>
      <div className="game-info">
        <p>Score: {score}</p>
        <p>Level: {level}</p>
        <p>Time Left: {timeLeft}s</p>
      </div>

      {showLevelSelect ? (
        <div className="level-select">
          <h2>Select Difficulty</h2>
          {difficultyLevels.map((level) => (
            <button
              key={level}
              className={`difficulty-button ${
                difficulty === level ? "selected" : ""
              }`}
              onClick={() => setDifficulty(level)}
            >
              {level}
            </button>
          ))}
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : gameActive ? (
        particles.map((particle) => (
          <div
            key={particle.id}
            className={`particle ${particle.type}`}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
            }}
            onClick={() => catchParticle(particle.id, particle.points)}
          />
        ))
      ) : (
        <div className="game-over">
          <h2>Game Over</h2>
          <p>Final Score: {score}</p>
          <button
            className="start-button"
            onClick={() => setShowLevelSelect(true)}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QuantumRealm;
