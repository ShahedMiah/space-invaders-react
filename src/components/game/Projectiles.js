import React from 'react';

const Projectiles = ({ projectiles }) => {
  return (
    <div className="projectiles-container">
      {projectiles.map((projectile, index) => (
        <div
          key={index}
          className="projectile"
          style={{
            position: 'absolute',
            left: `${projectile.x}px`,
            top: `${projectile.y}px`,
            width: '4px',
            height: '10px',
            backgroundColor: projectile.type === 'player' ? 'yellow' : 'purple'
          }}
        />
      ))}
    </div>
  );
};

export default Projectiles;