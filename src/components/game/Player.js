import React, { useEffect, useState } from 'react';

const Player = ({ position, onMove, onShoot }) => {
  const MOVEMENT_SPEED = 10; // pixels per movement

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          onMove('left', MOVEMENT_SPEED);
          break;
        case 'ArrowRight':
          onMove('right', MOVEMENT_SPEED);
          break;
        case ' ':
          onShoot(position); // Pass current position to shoot function
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
        bottom: '20px',
        width: '40px',
        height: '40px',
        backgroundColor: 'green'
      }}
    />
  );
};

export default Player;