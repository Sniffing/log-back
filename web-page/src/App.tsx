import React, { Component } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Provider, observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { Menu, Icon } from 'antd';
import './App.css';
import Home from './pages/home';
import CalendarPage from './pages/calendar';
import WeightPage from './pages/weight';
import KeywordPage from './keywords/keyword';
import MemoryPage from './pages/memory';

import rootStore from './stores/rootStore';
import { ClickParam } from 'antd/lib/menu';

const pages = ['weight', 'keywords', 'calendar', 'memory'];

@observer
class App extends Component<RouteComponentProps> {
  @observable
  private current: string = "";

  @action
  private handleClick = (param: ClickParam) => {
    this.current = param.key;
    this.props.history.push(`/${pages.includes(this.current) ? this.current : '' }`);
  }

  public render() {
    const routeOptions = pages.map(page =>
      <Menu.Item key={page}>{page}</Menu.Item>
    );

    return (
    
    <Provider
      rootStore={rootStore}
      >
      <div className="App rain">
        <Menu onClick={this.handleClick} selectedKeys={[this.current]} mode="horizontal">
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
        </Menu>
        <body className="App-body">
          <Route exact path='/' component={ Home } />
          <Route path='/weight' component={ WeightPage } />
          <Route path='/keywords' component={ KeywordPage } />
          <Route path='/calendar' component={ CalendarPage } />
          <Route path='/memory' component={ MemoryPage } />
        </body>
      </div>
      </Provider>
    );
  }
}

export default withRouter(App);
