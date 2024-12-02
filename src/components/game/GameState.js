import React, { useCallback, useEffect, useState } from 'react';

const useGameState = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    gameOver: false,
    isPaused: false
  });

  const updateScore = useCallback((points) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points
    }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = prev.lives - 1;
      return {
        ...prev,
        lives: newLives,
        gameOver: newLives <= 0
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      gameOver: false,
      isPaused: false
    });
  }, []);

  return {
    gameState,
    updateScore,
    loseLife,
    togglePause,
    resetGame
  };
};

export default useGameState;