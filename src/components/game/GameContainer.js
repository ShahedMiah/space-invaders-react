import React, { useState, useCallback, useEffect } from 'react';
import { useInterval } from '../../hooks/useInterval';
import Player from './Player';
import Aliens from './Aliens';
import Projectiles from './Projectiles';
import GameHUD from './GameHUD';
import useGameState from './GameState';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_SPEED = 1;
const ALIEN_DROP = 30;

const GameContainer = () => {
  const [playerPosition, setPlayerPosition] = useState({ 
    x: GAME_WIDTH / 2 - 25,
    y: GAME_HEIGHT - 60,
    width: 50,
    height: 40
  });
  
  const [aliens, setAliens] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [alienDirection, setAlienDirection] = useState(1);
  const { gameState, updateScore, loseLife, togglePause, resetGame } = useGameState();

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

  const handlePlayerMove = useCallback((direction) => {
    if (gameState.gameOver) return;
    
    setPlayerPosition(prev => {
      const newX = direction === 'left'
        ? Math.max(0, prev.x - PLAYER_SPEED)
        : Math.min(GAME_WIDTH - prev.width, prev.x + PLAYER_SPEED);
      return { ...prev, x: newX };
    });
  }, [gameState.gameOver]);

  const handlePlayerShoot = useCallback(() => {
    if (gameState.gameOver) return;

    const now = Date.now();
    setProjectiles(prev => {
      if (prev.length === 0 || now - prev[prev.length - 1].timestamp > 250) {
        return [...prev, {
          x: playerPosition.x + playerPosition.width / 2 - 2,
          y: playerPosition.y,
          width: 4,
          height: 10,
          type: 'player',
          timestamp: now,
        }];
      }
      return prev;
    });
  }, [gameState.gameOver, playerPosition]);

  // Update projectiles and check collisions
  useInterval(() => {
    if (gameState.gameOver) return;

    setProjectiles(prev => prev.filter(bullet => {
      bullet.y -= BULLET_SPEED;
      return bullet.y > 0;
    }));

    setProjectiles(prev => prev.filter(bullet => {
      let hit = false;
      setAliens(prevAliens => prevAliens.filter(alien => {
        const collision = !(bullet.x > alien.x + alien.width ||
          bullet.x + bullet.width < alien.x ||
          bullet.y > alien.y + alien.height ||
          bullet.y + bullet.height < alien.y);
        
        if (collision) {
          hit = true;
          updateScore(100);
        }
        return !collision;
      }));
      return !hit;
    }));
  }, 16);

  // Update alien positions
  useInterval(() => {
    if (gameState.gameOver) return;

    let shouldChangeDirection = false;
    setAliens(prev => prev.map(alien => {
      const newX = alien.x + ALIEN_SPEED * alienDirection;
      if (newX <= 0 || newX >= GAME_WIDTH - alien.width) {
        shouldChangeDirection = true;
      }
      return alien;
    }));

    if (shouldChangeDirection) {
      setAlienDirection(prev => -prev);
      setAliens(prev => prev.map(alien => ({
        ...alien,
        y: alien.y + ALIEN_DROP,
      })));
    } else {
      setAliens(prev => prev.map(alien => ({
        ...alien,
        x: alien.x + ALIEN_SPEED * alienDirection,
      })));
    }

    setAliens(prev => {
      const alienReachedBottom = prev.some(alien => alien.y + alien.height >= playerPosition.y);
      if (alienReachedBottom) {
        gameState.gameOver = true;
      }
      return prev;
    });
  }, 50);

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