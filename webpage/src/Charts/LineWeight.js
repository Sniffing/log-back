import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

class LineWeight extends Component {
  state = {
    data: []
  }

  async componentDidMount() {
    this.callApi()
        .then(res => {
          this.setState({data: res});

          this.state.data.sort((a,b) => {
            var aDate = new Date(a.date);
            var bDate = new Date(b.date);
            return aDate - bDate;
          });
        })
        .catch(err => {
          console.log(err);
        });
  }

  callApi = async () => {
    const response = await fetch('/weight');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <LineChart width={900} height={300} data={this.state.data}>
        <Line type="monotone" dataKey="weight" stroke="#FFFFFF"/>
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="date"/>
        <YAxis domain={['dataMin - 3','dataMax + 3']}/>
        <YAxis tick={{stroke:'black', strokeWidth:2}}/>
        <Tooltip/>
      </LineChart>
    );
  }
}

export default LineWeight;
