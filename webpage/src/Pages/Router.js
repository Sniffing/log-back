import React from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import * as Constants from '../constants'

const Router = () => {
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
      <Link to='/'>
        <Card>
          <p> Home </p>
        </Card>
      </Link>
      {cards}
    </div>
  );
}

export default Router;
