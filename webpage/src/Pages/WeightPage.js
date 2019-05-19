import React from 'react';
import LineWeight from '../Charts/LineWeight';

const WeightPage = () => {
  return (
    <div className='weight-page'>
      <p>This is your weight over time!</p>
      <LineWeight />
    </div>
  );
}

export default WeightPage;
