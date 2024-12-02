import React, { useState, useCallback, useEffect } from 'react';
import { useInterval } from '../../hooks/useInterval';
import Player from './Player';
import Aliens from './Aliens';
import Projectiles from './Projectiles';
import GameHUD from './GameHUD';
import useGameState from './GameState';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BULLET_SPEED = 7;
const ALIEN_SPEED = 1;
const ALIEN_DROP = 30;

const GameContainer = () => {
  // Game state management
  const { gameState, updateScore, loseLife, resetGame } = useGameState();
  
  // Entity states
  const [playerPosition, setPlayerPosition] = useState({ 
    x: GAME_WIDTH / 2 - 25,
    y: GAME_HEIGHT - 60,
    width: 50,
    height: 40
  });
  
  const [aliens, setAliens] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [alienDirection, setAlienDirection] = useState(1);

  // Initialize aliens
  useEffect(() => {
    const initialAliens = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        initialAliens.push({
          x: col * 70 + 150,
          y: row * 60 + 50,
          width: 40,
          height: 30,
        });
      }
    }
    setAliens(initialAliens);
  }, []);

  // Player movement handler
  const handlePlayerMove = useCallback((direction, speed) => {
    if (gameState.gameOver) return;
    
    setPlayerPosition(prev => {
      const newX = direction === 'left'
        ? Math.max(0, prev.x - speed)
        : Math.min(GAME_WIDTH - prev.width, prev.x + speed);
      return { ...prev, x: newX };
    });
  }, [gameState.gameOver]);

  // Player shooting handler
  const handlePlayerShoot = useCallback((playerPos) => {
    if (gameState.gameOver) return;

    const now = Date.now();
    setProjectiles(prev => {
      // Implement shooting cooldown
      if (prev.length === 0 || now - prev[prev.length - 1].timestamp > 250) {
        return [...prev, {
          x: playerPos.x + playerPos.width / 2 - 2,
          y: playerPos.y,
          width: 4,
          height: 10,
          type: 'player',
          timestamp: now,
        }];
      }
      return prev;
    });
  }, [gameState.gameOver]);

  // Projectile movement and collision detection
  useInterval(() => {
    if (gameState.gameOver) return;

    // Update projectile positions
    setProjectiles(prev => 
      prev
        .map(bullet => ({
          ...bullet,
          y: bullet.y - BULLET_SPEED
        }))
        .filter(bullet => bullet.y > 0)
    );

    // Check for collisions
    setProjectiles(prev => prev.filter(bullet => {
      let hit = false;
      
      setAliens(prevAliens => prevAliens.filter(alien => {
        const collision = checkCollision(bullet, alien);
        if (collision) {
          hit = true;
          updateScore(100);
        }
        return !collision;
      }));
      
      return !hit;
    }));
  }, 16);

  // Alien movement
  useInterval(() => {
    if (gameState.gameOver) return;

    // Check if aliens need to change direction
    const needsDirectionChange = aliens.some(alien => {
      const newX = alien.x + ALIEN_SPEED * alienDirection;
      return newX <= 0 || newX >= GAME_WIDTH - alien.width;
    });

    if (needsDirectionChange) {
      setAlienDirection(prev => -prev);
      setAliens(prev => prev.map(alien => ({
        ...alien,
        y: alien.y + ALIEN_DROP
      })));
    } else {
      setAliens(prev => prev.map(alien => ({
        ...alien,
        x: alien.x + ALIEN_SPEED * alienDirection
      })));
    }

    // Check for game over condition
    const alienReachedBottom = aliens.some(alien => 
      alien.y + alien.height >= playerPosition.y
    );

    if (alienReachedBottom) {
      loseLife();
    }
  }, 50);

  // Collision detection helper
  const checkCollision = (rect1, rect2) => {
    return !(
      rect1.x > rect2.x + rect2.width ||
      rect1.x + rect1.width < rect2.x ||
      rect1.y > rect2.y + rect2.height ||
      rect1.y + rect1.height < rect2.y
    );
  };

  return (
    <div 
      className="relative w-full h-full bg-black"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
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
      <Aliens aliens={aliens} />
      <Projectiles projectiles={projectiles} />

      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameContainer;