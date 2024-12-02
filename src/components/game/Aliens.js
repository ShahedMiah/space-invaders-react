import React from 'react';

const Aliens = ({ aliens, onAlienMove }) => {
  return (
    <div className="aliens-container">
      {aliens.map((alien, index) => (
        <div
          key={index}
          className="alien"
          style={{
            position: 'absolute',
            left: `${alien.x}px`,
            top: `${alien.y}px`,
            width: '30px',
            height: '30px',
            backgroundColor: 'red'
          }}
        />
      ))}
    </div>
  );
};

export default Aliens;