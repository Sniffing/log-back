import React, { Component } from 'react';
import LineWeight from './Charts/LineWeight'
import KeywordsCount from './Charts/KeywordsCount'
import BarChartKeywords from './Charts/BarChartKeywords'
import CalendarHeatMap from './Charts/CalendarHeatMap'
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p> Welcome to your third eye </p>
          <KeywordsCount/>

        </header>
      </div>
    );
  }
}

export default App;
