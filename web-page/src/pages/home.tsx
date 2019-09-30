import React from "react";
import { Card, Row, Col } from "antd";
import { Link } from "react-router-dom";
import Constants from "../App.constants";
import { Utils } from "../App.utils";

class Home extends React.Component {
  private pages: any;
  private count: number;

  constructor(props: any) {
    super(props);
    this.pages = Constants.pages;
    this.count = this.pages.length;
  }

  private cards = () => {
    return this.pages.map((route: string) => (
      <Col span={24 / this.count} key={route}>
        <Link to={`/${route}`}>
          <Card>
            <h1>{`${Utils.capitaliseFirst(route)}`}</h1>
          </Card>
        </Link>
      </Col>
    ));
  };

  public render() {
    return (
      <div style={{ width: "100%", paddingLeft: "20px", paddingRight: "20px" }}>
        <Row gutter={16}>{this.cards()}</Row>
      </div>
    );
  }
}

export default Home;
