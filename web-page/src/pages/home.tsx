import React from "react";
import { Card, Row, Col } from "antd";
import { Link } from "react-router-dom";
import Constants from "../App.constants";
import { Utils } from "../App.utils";

class Home extends React.Component {
  private pages: any;
  private count: number;

  private rows: number = 2;
  private cols: number = 2;

  constructor(props: any) {
    super(props);
    this.pages = Constants.pages;
    this.count = this.pages.length;
  }

  private cards = () => {
    const r = Array.from(new Array(this.rows), (x,i) => i+1);
    const c = Array.from(new Array(this.cols), (x,i) => i+1);
    
    let v =  r.map((x,i) => (
      <Row gutter={[16, 16]}>
        {c.map((x,j) => 
          this.rowCards(this.pages[i*this.cols + j], 24/this.cols)
        )}
      </Row>
    ))    
    console.log(v)
    return v;
  };

  private rowCards = (route: string,  span: number) => {
    console.log(route);
    return (<Col span={span} key={route}>
      <Link to={`/${route}`}>
        <Card>
          <h1>{`${Utils.capitaliseFirst(route)}`}</h1>
        </Card>
      </Link>
    </Col>)
  };

  public render() {
    return (
      <div style={{ width: "100%", paddingLeft: "20px", paddingRight: "20px" }}>
        {this.cards()}
      </div>
    );
  }
}

export default Home;
