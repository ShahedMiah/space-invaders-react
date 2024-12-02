import React, { useState, useCallback, useEffect } from 'react';
import Player from './Player';
import Aliens from './Aliens';
import Projectiles from './Projectiles';
import GameHUD from './GameHUD';
import useGameState from './GameState';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const GameContainer = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 });
  const [aliens, setAliens] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const { gameState, updateScore, loseLife, togglePause, resetGame } = useGameState();

  const handlePlayerMove = useCallback((direction, speed) => {
    setPlayerPosition(prev => {
      const newX = direction === 'left' 
        ? Math.max(0, prev.x - speed)
        : Math.min(GAME_WIDTH - 40, prev.x + speed);
      
      return {
        ...prev,
        x: newX
      };
    });
  }, []);

  const handlePlayerShoot = useCallback((playerPos) => {
    if (gameState.gameOver || gameState.isPaused) return;

    setProjectiles(prev => [...prev, {
      x: playerPos.x + 18, // Center the bullet on the player
      y: playerPos.y,
      type: 'player'
    }]);
  }, [gameState.gameOver, gameState.isPaused]);

  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    const gameLoop = setInterval(() => {
      // Update projectiles
      setProjectiles(prev => prev.map(p => ({
        ...p,
        y: p.y + (p.type === 'player' ? -5 : 3)
      })).filter(p => p.y > 0 && p.y < GAME_HEIGHT));

      // Update aliens
      // Add alien movement logic here

      // Check collisions
      // Add collision detection logic here
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameState.gameOver, gameState.isPaused]);

  return (
    <div 
      className="game-container"
      style={{
        position: 'relative',
        width: `${GAME_WIDTH}px`,
        height: `${GAME_HEIGHT}px`,
        backgroundColor: 'black',
        overflow: 'hidden'
      }}
    >
      <GameHUD 
        score={gameState.score}
        lives={gameState.lives}
        gameOver={gameState.gameOver}
      />
      <Player 
        position={playerPosition}
        onMove={handlePlayerMove}
        onShoot={handlePlayerShoot}
      />
      <Aliens 
        aliens={aliens}
      />
      <Projectiles 
        projectiles={projectiles}
      />
    </div>
  );
};

export default GameContainer;