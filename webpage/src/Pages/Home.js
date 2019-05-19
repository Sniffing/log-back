import React from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import * as Constants from '../constants'

const Home = () => {
  const pages = Constants.pages;
  const cards = pages.map(route =>
    <Link to={`/${route}`}>
      <Card>
        <p>{route}</p>
      </Card>
    </Link>
  );

  return (
    <div>
      <p> Welcome to your third eye </p>
      {cards}
    </div>
  );
}

export default Home;
