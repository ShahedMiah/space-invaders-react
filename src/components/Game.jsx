import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerShip, Alien } from './GameGraphics';

const ALIEN_SPEED = 2;
const ALIEN_DROP = 30;
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const BULLET_SPEED = 7;
const POWERUP_SPEED = 2;
const ALIEN_BULLET_SPEED = 5;
const PLAYER_LIVES = 3;

export const HomeScreen = ({ onStart }) => {
  const [currentHighScores, setCurrentHighScores] = useState(() => {
    const saved = localStorage.getItem('highScores');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem('highScores');
    setCurrentHighScores(saved ? JSON.parse(saved) : []);
  }, []);

  return (
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
          {currentHighScores.map((score, index) => (
            <li key={index} className="mb-2">
              {index + 1}. {score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const GameOverScreen = ({ score, onReplay, onHome }) => {
  const handleHome = () => {
    const saved = localStorage.getItem('highScores');
    const currentScores = saved ? JSON.parse(saved) : [];
    if (score > 0) {
      const newScores = [...currentScores, score].sort((a, b) => b - a).slice(0, 5);
      localStorage.setItem('highScores', JSON.stringify(newScores));
    }
    onHome();
  };

  return (
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
          onClick={handleHome}
          className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export const GameContainer = () => {
  const [gameState, setGameState] = useState('home');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScores');
    const scores = saved ? JSON.parse(saved) : [];
    return scores.length > 0 ? scores[0] : 0;
  });
  const [playerPosition, setPlayerPosition] = useState({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 50 });
  const [aliens, setAliens] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [alienBullets, setAlienBullets] = useState([]);
  const [lastShot, setLastShot] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  const [playerPowerUp, setPlayerPowerUp] = useState(null);
  const [lives, setLives] = useState(PLAYER_LIVES);
  const [isHit, setIsHit] = useState(false);
  const [alienDirection, setAlienDirection] = useState(1);
  const [explodingAliens, setExplodingAliens] = useState([]);
  const keysPressed = useRef(new Set());

  const handleGameOver = useCallback(() => {
    const saved = localStorage.getItem('highScores');
    const currentScores = saved ? JSON.parse(saved) : [];
    if (score > 0) {
      const newScores = [...currentScores, score].sort((a, b) => b - a).slice(0, 5);
      localStorage.setItem('highScores', JSON.stringify(newScores));
      setHighScore(Math.max(highScore, score));
    }
    setGameState('gameOver');
  }, [score, highScore]);

  const initializeGame = useCallback(() => {
    const initialAliens = [];
    for(let row = 0; row < 3; row++) {
      for(let col = 0; col < 8; col++) {
        initialAliens.push({
          id: `${row}-${col}`,
          x: col * 60 + 160,
          y: row * 60 + 50,
          width: 40,
          height: 40,
          type: row + 1
        });
      }
    }
    setAliens(initialAliens);
    setAlienBullets([]);
    setScore(0);
    setBullets([]);
    setPowerUps([]);
    setPlayerPowerUp(null);
    setLives(PLAYER_LIVES);
    setIsHit(false);
    setAlienDirection(1);
    setExplodingAliens([]);
    setGameState('playing');
    setPlayerPosition({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 50 });
  }, []);

  const shoot = useCallback(() => {
    const now = Date.now();
    const cooldown = playerPowerUp?.type === 'rapidFire' ? 100 : 250;
    if (now - lastShot > cooldown) {
      const newBullets = [];
      if (playerPowerUp?.type === 'multiShot') {
        newBullets.push(
          { id: now, x: playerPosition.x - 10, y: playerPosition.y - 20 },
          { id: now + 1, x: playerPosition.x, y: playerPosition.y - 20 },
          { id: now + 2, x: playerPosition.x + 10, y: playerPosition.y - 20 }
        );
      } else {
        newBullets.push({ id: now, x: playerPosition.x, y: playerPosition.y - 20 });
      }
      setBullets(prev => [...prev, ...newBullets]);
      setLastShot(now);
    }
  }, [playerPosition, lastShot, playerPowerUp]);

  const alienShoot = useCallback(() => {
    setAliens(currentAliens => {
      const bottomAliens = new Map();
      currentAliens.forEach(alien => {
        const col = Math.round(alien.x);
        if (!bottomAliens.has(col) || bottomAliens.get(col).y < alien.y) {
          bottomAliens.set(col, alien);
        }
      });

      const shootingAliens = Array.from(bottomAliens.values());
      shootingAliens.forEach(alien => {
        if (Math.random() < 0.02) {
          setAlienBullets(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: alien.x,
            y: alien.y + alien.height
          }]);
        }
      });

      return currentAliens;
    });
  }, []);

  const updateBullets = useCallback(() => {
    setBullets(prev => {
      const updatedBullets = prev.map(bullet => ({
        ...bullet,
        y: bullet.y - BULLET_SPEED
      })).filter(bullet => bullet.y > 0);

      setAliens(prevAliens => {
        const remainingAliens = prevAliens.filter(alien => {
          const hit = updatedBullets.some(bullet => 
            bullet.x > alien.x - 20 && 
            bullet.x < alien.x + 20 && 
            bullet.y > alien.y - 20 && 
            bullet.y < alien.y + 20
          );
          if (hit) {
            setScore(s => s + 100);
            setExplodingAliens(prev => [...prev, { ...alien, explodeStartTime: Date.now() }]);
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
  }, [aliens, handleGameOver]);

  const updateAlienBullets = useCallback(() => {
    setAlienBullets(prev => {
      const updatedBullets = prev.map(bullet => ({
        ...bullet,
        y: bullet.y + ALIEN_BULLET_SPEED
      })).filter(bullet => bullet.y < SCREEN_HEIGHT);

      const playerHit = updatedBullets.some(bullet => 
        bullet.x > playerPosition.x - 20 &&
        bullet.x < playerPosition.x + 20 &&
        bullet.y > playerPosition.y - 20 &&
        bullet.y < playerPosition.y + 20
      );

      if (playerHit) {
        setLives(prev => prev - 1);
        setIsHit(true);
        setTimeout(() => setIsHit(false), 300);
        if (lives <= 1) {
          handleGameOver();
        }
        return [];
      }

      return updatedBullets;
    });
  }, [playerPosition, lives, handleGameOver]);

  const updatePowerUps = useCallback(() => {
    setPowerUps(prev => {
      const updatedPowerUps = prev.map(powerUp => ({
        ...powerUp,
        y: powerUp.y + POWERUP_SPEED
      })).filter(powerUp => {
        if (powerUp.y > SCREEN_HEIGHT) return false;
        
        const collected = (
          powerUp.x > playerPosition.x - 30 &&
          powerUp.x < playerPosition.x + 30 &&
          powerUp.y > playerPosition.y - 30 &&
          powerUp.y < playerPosition.y + 30
        );

        if (collected) {
          setPlayerPowerUp({
            type: powerUp.type,
            expiresAt: Date.now() + 10000
          });
          return false;
        }

        return true;
      });

      return updatedPowerUps;
    });
  }, [playerPosition]);

  const updatePowerUpStatus = useCallback(() => {
    if (playerPowerUp && Date.now() > playerPowerUp.expiresAt) {
      setPlayerPowerUp(null);
    }
  }, [playerPowerUp]);

  const updateAliens = useCallback(() => {
    setAliens(prevAliens => {
      let shouldChangeDirection = false;
      const updatedAliens = prevAliens.map(alien => ({
        ...alien,
        x: alien.x + (ALIEN_SPEED * alienDirection)
      }));

      // Check if any alien hits the screen bounds
      updatedAliens.forEach(alien => {
        if (alien.x <= 0 || alien.x >= SCREEN_WIDTH - alien.width) {
          shouldChangeDirection = true;
        }
      });

      if (shouldChangeDirection) {
        setAlienDirection(prev => -prev);
        return prevAliens.map(alien => ({
          ...alien,
          y: alien.y + ALIEN_DROP
        }));
      }

      // Check for collision with player
      if (updatedAliens.some(alien => 
        alien.y + alien.height > playerPosition.y - 20 &&
        Math.abs(alien.x - playerPosition.x) < 40
      )) {
        setLives(prev => prev - 1);
        setIsHit(true);
        setTimeout(() => setIsHit(false), 300);
        if (lives <= 1) {
          handleGameOver();
        }
      }

      return updatedAliens;
    });
  }, [alienDirection, playerPosition.x, playerPosition.y, lives, handleGameOver]);

  const updateExplodingAliens = useCallback(() => {
    setExplodingAliens(prev => 
      prev.filter(alien => Date.now() - alien.explodeStartTime < 300)
    );
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const processKeys = () => {
        if (keysPressed.current.has('ArrowLeft')) {
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.max(20, prev.x - 5)
          }));
        }
        if (keysPressed.current.has('ArrowRight')) {
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.min(SCREEN_WIDTH - 20, prev.x + 5)
          }));
        }
        if (keysPressed.current.has(' ')) {
          shoot();
        }
      };

      const gameLoop = () => {
        processKeys();
        requestAnimationFrame(gameLoop);
      };
      const animationId = requestAnimationFrame(gameLoop);

      const updateLoop = setInterval(() => {
        updateAliens();
        updateBullets();
        updateAlienBullets();
        updatePowerUps();
        updatePowerUpStatus();
        updateExplodingAliens();
        alienShoot();
      }, 50);

      return () => {
        clearInterval(updateLoop);
        cancelAnimationFrame(animationId);
      };
    }
  }, [gameState, shoot, updateAliens, updateBullets, updateAlienBullets, updatePowerUps, updatePowerUpStatus, updateExplodingAliens, alienShoot]);

  if (gameState === 'home') {
    return <HomeScreen onStart={initializeGame} />;
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
        <div style={{ left: playerPosition.x, bottom: 20 }} 
          className={`absolute transform -translate-x-1/2 ${playerPowerUp ? 'animate-pulse' : ''}`}>
          <PlayerShip isHit={isHit} />
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

        {alienBullets.map(bullet => (
          <div
            key={bullet.id}
            style={{ 
              left: bullet.x, 
              top: bullet.y,
              width: 4,
              height: 10,
              backgroundColor: 'red',
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
            <Alien type={alien.type} />
          </div>
        ))}

        {explodingAliens.map(alien => (
          <div
            key={alien.id}
            style={{ left: alien.x, top: alien.y }}
            className="absolute transform -translate-x-1/2"
          >
            <Alien type={alien.type} isExploding={true} />
          </div>
        ))}

        {powerUps.map(powerUp => (
          <div
            key={powerUp.id}
            style={{ left: powerUp.x, top: powerUp.y }}
            className="absolute transform -translate-x-1/2"
          >
            <div className={`w-6 h-6 rounded-full ${powerUp.type === 'rapidFire' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
          </div>
        ))}

        <div className="absolute top-4 right-4 text-white text-xl space-y-2">
          <div>Score: {score}</div>
          <div>High Score: {highScore}</div>
          {playerPowerUp && (
            <div className="text-sm">
              Power-up: {playerPowerUp.type === 'rapidFire' ? 'Rapid Fire' : 'Multi Shot'}
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 flex space-x-2">
          {Array.from({ length: lives }).map((_, i) => (
            <div key={i} className="w-6 h-6 text-green-500">♥</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameContainer;