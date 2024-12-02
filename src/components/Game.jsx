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
        updateExplodingAliens();
        alienShoot();
      }, 50);

      return () => {
        clearInterval(updateLoop);
        cancelAnimationFrame(animationId);
      };
    }
  }, [gameState, shoot, updateAliens, updateBullets, updateAlienBullets, updatePowerUps, updateExplodingAliens, alienShoot]);

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
