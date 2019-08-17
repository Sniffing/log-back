import React from 'react';
import { Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import * as Constants from '../constants'


class Home extends React.Component {

  private pages;  
  private count: number;

  constructor(props) {
    super(props);
    this.pages = Constants.pages;
    this.count = this.pages.length;
  }

  private cards = () => {
    return this.pages.map(route => 
      <Col span={24/this.count} key={route}>
        <Link to={`/${route}`}>
          <Card>
            <p style={{ textAlign: 'center' }}>{route}</p>
          </Card>
        </Link>
      </Col>
    )
    };

  public render() {
    return (
      <div style={{ width: "100%", paddingLeft: '20px', paddingRight: '20px'}}>
        <Row gutter={16}>
        {this.cards()}
        </Row>
      </div>
    );
  } 
}

export default Home;
