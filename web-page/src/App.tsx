import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Menu, Icon } from 'antd';
import './App.css';
import Home from './pages/home';
import CalendarPage from './pages/calendar';
import WeightPage from './pages/weight';
import KeywordPage from './pages/keyword';

const pages = ['weight', 'keywords', 'calendar', 'memory'];


@observer
class App extends Component {
  @observable
  private current: string = "";

  public render() {
    const routeOptions = pages.map(page =>
      <Menu.Item key={page}>{page}</Menu.Item>
    );

    return (
      <div className="App">
        {/* <Menu onClick={this.handleClick} selectedKeys={[this.current]} mode="horizontal">
            <Menu.Item key="home">
              <Icon type="home" />
            </Menu.Item>
            <Menu.SubMenu
              title={
                <span className="submenu-title-wrapper">
                  <Icon type="down-circle" />
                  {this.current}
                </span>
              }
            >
              {routeOptions}
            </Menu.SubMenu>
        </Menu> */}
        <header className="App-header">
          <Route exact path='/' component={ Home } />
          <Route path='/weight' component={ WeightPage } />
          <Route path='/keywords' component={ KeywordPage } />
          <Route path='/calendar' component={ CalendarPage } />
          {/* <Route path='/memory' component={ MemoryPage } /> */}
        </header>
      </div>
    );
  }
}

export default App;
