import React from 'react';

const GameHUD = ({ score, lives, gameOver }) => {
  return (
    <div className="game-hud" style={{ position: 'absolute', top: '10px', left: '10px', color: 'white' }}>
      <div>Score: {score}</div>
      <div>Lives: {lives}</div>
      {gameOver && (
        <div className="game-over" style={{ fontSize: '2em', color: 'red' }}>
          GAME OVER
        </div>
      )}
    </div>
  );
};

export default GameHUD;