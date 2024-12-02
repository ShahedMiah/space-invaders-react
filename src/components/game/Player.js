import React, { useEffect } from 'react';

const PLAYER_SPEED = 5;

const Player = ({ position, onMove, onShoot }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          onMove('left', PLAYER_SPEED);
          break;
        case 'ArrowRight':
          onMove('right', PLAYER_SPEED);
          break;
        case ' ':
          onShoot(position);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMove, onShoot, position]);

  return (
    <div 
      className="player" 
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        backgroundColor: 'green',
        transition: 'left 0.1s ease-out' // Smooth movement
      }}
    />
  );
};

export default Player;