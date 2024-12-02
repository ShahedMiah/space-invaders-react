import React, { useState, useEffect } from 'react';
import { useInterval } from '../hooks/useInterval';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_SPEED = 1;
const ALIEN_DROP = 30;

const SpaceInvaders = () => {
  const [player, setPlayer] = useState({
    x: GAME_WIDTH / 2 - 25,
    y: GAME_HEIGHT - 60,
    width: 50,
    height: 40,
  });

  const [bullets, setBullets] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState(1);
  const [keys, setKeys] = useState({
    left: false,
    right: false,
    space: false,
  });

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: true }));
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: true }));
      if (e.key === ' ') setKeys(prev => ({ ...prev, space: true }));
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: false }));
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: false }));
      if (e.key === ' ') setKeys(prev => ({ ...prev, space: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useInterval(() => {
    if (gameOver) return;
    
    if (keys.left && player.x > 0) {
      setPlayer(prev => ({ ...prev, x: prev.x - PLAYER_SPEED }));
    }
    if (keys.right && player.x < GAME_WIDTH - player.width) {
      setPlayer(prev => ({ ...prev, x: prev.x + PLAYER_SPEED }));
    }
  }, 16);

  useEffect(() => {
    if (keys.space) {
      const now = Date.now();
      setBullets(prev => {
        if (prev.length === 0 || now - prev[prev.length - 1].timestamp > 250) {
          return [...prev, {
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            timestamp: now,
          }];
        }
        return prev;
      });
    }
  }, [keys.space, player.x, player.y]);

  useInterval(() => {
    if (gameOver) return;

    setBullets(prev => prev.filter(bullet => {
      bullet.y -= BULLET_SPEED;
      return bullet.y > 0;
    }));

    setBullets(prev => prev.filter(bullet => {
      let hit = false;
      setAliens(prevAliens => prevAliens.filter(alien => {
        const collision = !(bullet.x > alien.x + alien.width ||
          bullet.x + bullet.width < alien.x ||
          bullet.y > alien.y + alien.height ||
          bullet.y + bullet.height < alien.y);
        
        if (collision) {
          hit = true;
          setScore(prev => prev + 100);
        }
        return !collision;
      }));
      return !hit;
    }));
  }, 16);

  useInterval(() => {
    if (gameOver) return;

    let shouldChangeDirection = false;
    setAliens(prev => prev.map(alien => {
      const newX = alien.x + ALIEN_SPEED * direction;
      if (newX <= 0 || newX >= GAME_WIDTH - alien.width) {
        shouldChangeDirection = true;
      }
      return alien;
    }));

    if (shouldChangeDirection) {
      setDirection(prev => -prev);
      setAliens(prev => prev.map(alien => ({
        ...alien,
        y: alien.y + ALIEN_DROP,
      })));
    } else {
      setAliens(prev => prev.map(alien => ({
        ...alien,
        x: alien.x + ALIEN_SPEED * direction,
      })));
    }

    setAliens(prev => {
      const alienReachedBottom = prev.some(alien => alien.y + alien.height >= player.y);
      if (alienReachedBottom) {
        setGameOver(true);
      }
      return prev;
    });
  }, 50);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <div 
        className="relative overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <div className="absolute top-4 left-4 text-white text-xl">
          Score: {score}
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-white text-4xl">Game Over!</div>
          </div>
        )}

        <div
          className="absolute bg-green-500"
          style={{
            left: player.x,
            top: player.y,
            width: player.width,
            height: player.height,
          }}
        />

        {bullets.map((bullet, index) => (
          <div
            key={index}
            className="absolute bg-yellow-500"
            style={{
              left: bullet.x,
              top: bullet.y,
              width: bullet.width,
              height: bullet.height,
            }}
          />
        ))}

        {aliens.map((alien, index) => (
          <div
            key={index}
            className="absolute bg-red-500"
            style={{
              left: alien.x,
              top: alien.y,
              width: alien.width,
              height: alien.height,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SpaceInvaders;