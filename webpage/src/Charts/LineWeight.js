import React, { Component } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';
import moment from 'moment';

class LineWeight extends Component {
  state = {
    data: [],
    startDate: null,
    endDate: null,
  };

  async componentDidMount() {
    this.callApi()
        .then(res => {
          const reformattedResults = res.map(({ date, weight }) => {
            return {
              date: Date.parse(date),
              weight: parseFloat(weight),
            }
          })

          reformattedResults.sort((a,b) => {
            var aDate = new Date(a.date);
            var bDate = new Date(b.date);
            return -(aDate - bDate);
          });

          this.setState({
            data: reformattedResults,
            startDate: reformattedResults[0].date,
            endDate: reformattedResults[reformattedResults.length-1].date
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
      <LineChart width={750} height={250} data={this.state.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey='date'
               domain={[this.state.startDate, this.state.endDate]}
               type='number' style={{fontSize: 12}}
               ticks={this.state.data.map(({date, weight}) => date) }
               tickFormatter={(tick) => moment(tick).format('DD/MM/YY')}/>
        <YAxis dataKey='weight' type='number' domain={['dataMin - 2', 'dataMax + 2']}/>
        <Line type="monotone" dataKey='weight' stroke="#8884d8" />
      </LineChart>
    );
  }
}

export default LineWeight;
