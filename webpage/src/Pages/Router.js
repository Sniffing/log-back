import React from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

const Router = () => (
  <div>
    <Link to='/'>
      <Card>
        <p> Home </p>
      </Card>
    </Link>
    <Link to='/weight'>
      <Card>
        <p> Weight </p>
      </Card>
    </Link>
    <Link to='/keywords'>
      <Card>
        <p> Words </p>
      </Card>
    </Link>
  </div>
);

export default Router;
