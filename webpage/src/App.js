import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import WeightPage from './Pages/WeightPage';
import KeywordPage from './Pages/KeywordPage';
import CalendarPage from './Pages/CalendarPage';
import MemoryPage from './Pages/MemoryPage';
import Home from './Pages/Home';
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Route exact path='/' component={ Home } />
          <Route path='/weight' component={ WeightPage } />
          <Route path='/keywords' component={ KeywordPage } />
          <Route path='/calendar' component={ CalendarPage } />
          <Route path='/memory' component={ MemoryPage } />
        </header>
      </div>
    );
  }
}

export default App;
