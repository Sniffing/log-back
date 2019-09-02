import React from 'react';

import LineWeight from '../charts/lineweight';
import rootStore from '../stores/rootStore';

class WeightPage extends React.Component {

    render() {
        return (
            <div className='weight-page'>
                <p>This is your weight over time!</p>
                <LineWeight rootStore={rootStore}/>
            </div>
            );
    }
}

export default WeightPage;
