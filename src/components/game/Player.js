import React from 'react';

const Player = ({ position, onMove, onShoot }) => {
  return (
    <div 
      className="player" 
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        backgroundColor: 'green'
      }}
    />
  );
};

export default Player;