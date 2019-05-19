import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import WeightPage from './Pages/WeightPage';
import KeywordPage from './Pages/KeywordPage';
import CalendarPage from './Pages/CalendarPage';
import MemoryPage from './Pages/MemoryPage';
import Home from './Pages/Home';
import { Menu, Icon } from 'antd';
import { pages } from './constants';
import './App.css';

class App extends Component {

  state = {
    current: 'home',
  };

  handleClick = (e) => {
    let { history } = this.props;

    this.setState({
      current: e.key,
    });

    switch(e.key) {
      case 'home':
        history.push({ pathname:'/' });
        break;
      default:
        history.push({ pathname:e.key });
    }
  };

  render() {
    const routeOptions = pages.map(page =>
        <Menu.Item key={page}>{page}</Menu.Item>
      );

    return (
      <div className="App">
        <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal">
            <Menu.Item key="home">
              <Icon type="home" />
            </Menu.Item>
            <Menu.SubMenu
              title={
                <span className="submenu-title-wrapper">
                  <Icon type="down-circle" />
                  {this.state.current}
                </span>
              }
            >
              {routeOptions}
            </Menu.SubMenu>
        </Menu>
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

export default withRouter(App);
