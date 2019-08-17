import React from 'react';
import { Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import * as Constants from '../constants'

const Home = () => {
  const pages = Constants.pages;
  const count = pages.length;
  const cards = pages.map(route =>
    <Col span={24/count} key={route}>
      <Link to={`/${route}`}>
        <Card>
          <p style={{ textAlign: 'center' }}>{route}</p>
        </Card>
      </Link>
    </Col>
  );

  return (
    <div style={{ width: "100%", paddingLeft: '20px', paddingRight: '20px'}}>
      <Row gutter={16}>
      {cards}
      </Row>
    </div>
  );
}

export default Home;
