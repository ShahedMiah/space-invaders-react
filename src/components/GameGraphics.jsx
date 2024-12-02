import React from 'react';

export const PlayerShip = () => (
  <svg viewBox="0 0 40 40" width="40" height="40">
    <path
      d="M20 5 L35 35 L20 25 L5 35 Z"
      fill="#4ade80"
      stroke="#166534"
      strokeWidth="2"
    />
  </svg>
);

export const Alien = () => (
  <svg viewBox="0 0 40 40" width="40" height="40">
    <path
      d="M20 8 L28 15 L35 15 L35 25 L28 25 L20 32 L12 25 L5 25 L5 15 L12 15 Z"
      fill="#818cf8"
      stroke="#3730a3"
      strokeWidth="2"
    />
    <circle cx="15" cy="20" r="3" fill="#3730a3" />
    <circle cx="25" cy="20" r="3" fill="#3730a3" />
  </svg>
);