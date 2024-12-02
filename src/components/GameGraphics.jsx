import React from 'react';

export const PlayerShip = ({ isHit }) => (
  <svg viewBox="0 0 40 40" width="40" height="40">
    <path
      d="M20 5 L35 35 L20 25 L5 35 Z"
      fill={isHit ? '#ff6b6b' : '#4ade80'}
      stroke={isHit ? '#c92a2a' : '#166534'}
      strokeWidth="2"
    />
    {isHit && (
      <circle cx="20" cy="20" r="15" fill="none" stroke="#ff6b6b">
        <animate
          attributeName="r"
          from="15"
          to="25"
          dur="0.3s"
          fill="freeze"
        />
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="0.3s"
          fill="freeze"
        />
      </circle>
    )}
  </svg>
);

const AlienExplosion = () => (
  <svg viewBox="0 0 40 40" width="40" height="40">
    <circle cx="20" cy="20" r="1">
      <animate
        attributeName="r"
        from="1"
        to="20"
        dur="0.3s"
        fill="freeze"
      />
      <animate
        attributeName="opacity"
        from="1"
        to="0"
        dur="0.3s"
        fill="freeze"
      />
    </circle>
  </svg>
);

export const Alien = ({ type, isExploding }) => {
  if (isExploding) return <AlienExplosion />;

  const aliens = {
    1: (
      <path
        d="M20 8 L28 15 L35 15 L35 25 L28 25 L20 32 L12 25 L5 25 L5 15 L12 15 Z"
        fill="#818cf8"
        stroke="#3730a3"
        strokeWidth="2"
      />
    ),
    2: (
      <path
        d="M10 15 L30 15 L35 25 L30 35 L10 35 L5 25 Z"
        fill="#a78bfa"
        stroke="#5b21b6"
        strokeWidth="2"
      />
    ),
    3: (
      <path
        d="M20 10 L35 20 L20 30 L5 20 Z"
        fill="#c084fc"
        stroke="#7e22ce"
        strokeWidth="2"
      />
    )
  };

  return (
    <svg viewBox="0 0 40 40" width="40" height="40">
      {aliens[type] || aliens[1]}
      <circle cx="15" cy="20" r="3" fill="#3730a3" />
      <circle cx="25" cy="20" r="3" fill="#3730a3" />
    </svg>
  );
};
