import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import WeightPage from './Pages/WeightPage';
import Router from './Pages/Router';
import './App.css';

const Home = () => (
  <p> Welcome to your third eye </p>
);

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Route exact path='/' component={ Home } />
          <Route path='/weight' component={ WeightPage } />
          <Router />
        </header>
      </div>
    );
  }
}

export default App;
