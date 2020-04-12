import React, { Component } from "react";
import { Route, RouteComponentProps, withRouter } from "react-router-dom";
import { Provider, observer } from "mobx-react";
import { observable, action } from "mobx";
import { Menu } from "antd";
import "./App.css";

import rootStore from "./stores/rootStore";
import { ClickParam } from "antd/lib/menu";
import { Home } from "./pages";
import { IPageConfig, Constants } from "./App.constants";
import { HomeOutlined, DownCircleOutlined } from "@ant-design/icons";

@observer
class App extends Component<RouteComponentProps> {
  @observable
  private current: string = "";

  @action
  private handleClick = (param: ClickParam) => {
    this.current = param.key;
    this.props.history.push(
      `/${
        Constants.pageConfigs
          .map((config: IPageConfig) => config.page.toLowerCase())
          .includes(this.current)
          ? this.current
          : ""
      }`
    );
  };

  public render() {
    const routeOptions = Constants.pageConfigs.map(page => (
      <Menu.Item key={page.page}>{page.page.toLowerCase()}</Menu.Item>
    ));

    return (
      <Provider rootStore={rootStore}>
        <div className="App rain">
          <Menu
            onClick={this.handleClick}
            selectedKeys={[this.current]}
            mode="horizontal"
          >
            <Menu.Item key="home">
              <HomeOutlined />
            </Menu.Item>
            <Menu.SubMenu
              title={
                <span className="submenu-title-wrapper">
                  <DownCircleOutlined />
                  {this.current}
                </span>
              }
            >
              {routeOptions}
            </Menu.SubMenu>
          </Menu>
          <div className="App-body">
            <Route exact path="/" component={Home} />
            {Constants.pageConfigs.map((page: IPageConfig) => (
              <Route
                key={page.page}
                path={page.path}
                component={page.component}
              />
            ))}
          </div>
        </div>
      </Provider>
    );
  }
}

export default withRouter(App);
