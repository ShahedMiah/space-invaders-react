import React, { useState, useEffect, useCallback } from 'react';
import { PlayerShip, Alien } from './GameGraphics';

const ALIEN_SPEED = 1;
const ALIEN_DROP = 20;
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

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

export const GameOverScreen = ({ score, onReplay }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-4xl mb-4">Game Over</h1>
    <p className="text-2xl mb-8">Score: {score}</p>
    <button
      onClick={onReplay}
      className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700"
    >
      Play Again
    </button>
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

  useEffect(() => {
    localStorage.setItem('highScores', JSON.stringify(highScores));
  }, [highScores]);

  const initializeGame = useCallback(() => {
    const initialAliens = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i % 5) * 80 + 160,
      y: Math.floor(i / 5) * 60 + 50,
    }));
    setAliens(initialAliens);
    setScore(0);
    setGameState('playing');
  }, []);

  const updateAliens = useCallback(() => {
    setAliens(prevAliens => {
      return prevAliens.map(alien => ({
        ...alien,
        y: alien.y + ALIEN_SPEED,
        x: alien.x + Math.sin(alien.y / 30) * 2,
      })).filter(alien => alien.y < SCREEN_HEIGHT);
    });
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(updateAliens, 50);
      return () => clearInterval(interval);
    }
  }, [gameState, updateAliens]);

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
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') movePlayer(-1);
      if (e.key === 'ArrowRight') movePlayer(1);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, movePlayer]);

  if (gameState === 'home') {
    return <HomeScreen onStart={initializeGame} highScores={highScores} />;
  }

  if (gameState === 'gameOver') {
    return <GameOverScreen score={score} onReplay={initializeGame} />;
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <div style={{ left: playerPosition.x, bottom: 20 }} className="absolute transform -translate-x-1/2">
        <PlayerShip />
      </div>
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
  );
};