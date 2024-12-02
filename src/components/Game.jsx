import React, { useState, useEffect, useCallback } from 'react';
import { PlayerShip, Alien } from './GameGraphics';

const ALIEN_SPEED = 1;
const ALIEN_DROP = 20;
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const BULLET_SPEED = 7;

export const HomeScreen = ({ onStart, highScores }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-4xl mb-8">Space Invaders</h1>
    <button
      onClick={onStart}
      className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 mb-8"
    >
      Start Game
    </button>
    <div className="text-left">
      <h2 className="text-2xl mb-4">High Scores</h2>
      <ul>
        {highScores.map((score, index) => (
          <li key={index} className="mb-2">
            {index + 1}. {score}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const GameOverScreen = ({ score, onReplay, onHome }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-4xl mb-4">Game Over</h1>
    <p className="text-2xl mb-8">Score: {score}</p>
    <div className="space-x-4">
      <button
        onClick={onReplay}
        className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Play Again
      </button>
      <button
        onClick={onHome}
        className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700"
      >
        Home
      </button>
    </div>
  </div>
);

export const GameContainer = () => {
  const [gameState, setGameState] = useState('home');
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('highScores');
    return saved ? JSON.parse(saved) : [];
  });
  const [playerPosition, setPlayerPosition] = useState({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 50 });
  const [aliens, setAliens] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [lastShot, setLastShot] = useState(0);

  useEffect(() => {
    localStorage.setItem('highScores', JSON.stringify(highScores));
  }, [highScores]);

  const initializeGame = useCallback(() => {
    const initialAliens = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i % 5) * 80 + 160,
      y: Math.floor(i / 5) * 60 + 50,
      width: 40,
      height: 40
    }));
    setAliens(initialAliens);
    setScore(0);
    setBullets([]);
    setGameState('playing');
    setPlayerPosition({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 50 });
  }, []);

  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShot > 250) { // Shooting cooldown
      setBullets(prev => [...prev, {
        id: now,
        x: playerPosition.x,
        y: playerPosition.y - 20
      }]);
      setLastShot(now);
    }
  }, [playerPosition, lastShot]);

  const updateBullets = useCallback(() => {
    setBullets(prev => {
      const updatedBullets = prev.map(bullet => ({
        ...bullet,
        y: bullet.y - BULLET_SPEED
      })).filter(bullet => bullet.y > 0);

      // Check for collisions
      setAliens(prevAliens => {
        let hitAliens = false;
        const remainingAliens = prevAliens.filter(alien => {
          const hit = updatedBullets.some(bullet => 
            bullet.x > alien.x - 20 && 
            bullet.x < alien.x + 20 && 
            bullet.y > alien.y - 20 && 
            bullet.y < alien.y + 20
          );
          if (hit) {
            hitAliens = true;
            setScore(s => s + 100);
          }
          return !hit;
        });

        if (remainingAliens.length === 0) {
          handleGameOver();
        }

        return remainingAliens;
      });

      return updatedBullets;
    });
  }, []);

  const updateAliens = useCallback(() => {
    setAliens(prevAliens => {
      const updatedAliens = prevAliens.map(alien => ({
        ...alien,
        y: alien.y + ALIEN_SPEED,
        x: alien.x + Math.sin(alien.y / 30) * 2,
      }));

      // Check if any alien reached player's position
      if (updatedAliens.some(alien => alien.y + alien.height > playerPosition.y)) {
        handleGameOver();
        return prevAliens;
      }

      return updatedAliens;
    });
  }, [playerPosition.y]);

  const handleGameOver = useCallback(() => {
    setHighScores(prev => {
      const newScores = [...prev, score].sort((a, b) => b - a).slice(0, 5);
      return newScores;
    });
    setGameState('gameOver');
  }, [score]);

  const movePlayer = useCallback((direction) => {
    setPlayerPosition(prev => ({
      ...prev,
      x: Math.max(20, Math.min(SCREEN_WIDTH - 20, prev.x + direction * 10)),
    }));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') movePlayer(-1);
      if (e.key === 'ArrowRight') movePlayer(1);
      if (e.key === ' ') shoot();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, movePlayer, shoot]);

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(() => {
        updateAliens();
        updateBullets();
      }, 50);
      return () => clearInterval(gameLoop);
    }
  }, [gameState, updateAliens, updateBullets]);

  if (gameState === 'home') {
    return <HomeScreen onStart={initializeGame} highScores={highScores} />;
  }

  if (gameState === 'gameOver') {
    return (
      <GameOverScreen 
        score={score} 
        onReplay={initializeGame} 
        onHome={() => setGameState('home')} 
      />
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="relative" style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
        <div style={{ left: playerPosition.x, bottom: 20 }} className="absolute transform -translate-x-1/2">
          <PlayerShip />
        </div>
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            style={{ 
              left: bullet.x, 
              top: bullet.y,
              width: 4,
              height: 10,
              backgroundColor: 'yellow',
            }}
            className="absolute transform -translate-x-1/2"
          />
        ))}
        {aliens.map(alien => (
          <div
            key={alien.id}
            style={{ left: alien.x, top: alien.y }}
            className="absolute transform -translate-x-1/2"
          >
            <Alien />
          </div>
        ))}
        <div className="absolute top-4 right-4 text-white text-xl">
          Score: {score}
        </div>
      </div>
    </div>
  );
};
