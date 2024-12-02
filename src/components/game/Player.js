import React, { useEffect, useState } from 'react';

const Player = ({ position, onMove, onShoot }) => {
  const [keyState, setKeyState] = useState({
    left: false,
    right: false,
    space: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          setKeyState(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
          setKeyState(prev => ({ ...prev, right: true }));
          break;
        case ' ':
          setKeyState(prev => ({ ...prev, space: true }));
          onShoot();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          setKeyState(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
          setKeyState(prev => ({ ...prev, right: false }));
          break;
        case ' ':
          setKeyState(prev => ({ ...prev, space: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onShoot]);

  useEffect(() => {
    if (keyState.left) onMove('left');
    if (keyState.right) onMove('right');
  }, [keyState, onMove]);

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