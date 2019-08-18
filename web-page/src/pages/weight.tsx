import React from 'react';
import LineWeight from '../charts/lineweight';

class WeightPage extends React.Component {
    render() {
        return (
            <div className='weight-page'>
                <p>This is your weight over time!</p>
                <LineWeight />
            </div>
            );
    }
}

export default WeightPage;
