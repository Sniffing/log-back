import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom';
import App from './App';

import 'antd/dist/antd.css';
import './index.css';
import './App.css';
import '../node_modules/react-vis/dist/style.css';

ReactDOM.render(
    <BrowserRouter>
      <App />  
  </BrowserRouter>,
  document.getElementById('root')
);
