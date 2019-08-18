import React from 'react';
import { Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

const pages = ['weight', 'keywords', 'calendar', 'memory'];

class Home extends React.Component {
  private pages: any;  
  private count: number;

  constructor(props: any) {
    super(props);
    this.pages = pages;
    this.count = this.pages.length;
  }

  private cards = () => {
    return this.pages.map((route: any) => 
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
