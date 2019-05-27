import React, { Component } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip } from 'recharts';
import { DatePicker } from 'antd';
import moment from 'moment';
const { RangePicker } = DatePicker;


class LineWeight extends Component {
  state = {
    data: [],
    startDate: null,
    endDate: null,
    earliestDate: null,
    currentData: [],
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
            return aDate - bDate;
          });

          this.setState({
            data: reformattedResults,
            currentData: reformattedResults,
            startDate: reformattedResults[0].date,
            earliestDate: reformattedResults[0].date,
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

  changeDateRange = ([newStart, newEnd]) => {
    if (newStart !== undefined) {
      this.setState({
        startDate: newStart.unix() * 1000,
      });
      console.log("settin new strt:", this.state.startDate);
    }
    if (newEnd !== undefined) {
      this.setState({
        endDate: newEnd.unix() * 1000,
      });
      console.log("setting new end:", this.state.endDate);
    }

    const filteredData = this.state.data
                                .filter(data => {
                                    return data.date >= this.state.startDate && data.date < this.state.endDate;
                                });
    this.setState({
      currentData: filteredData,
    });
  }

  changeStartDate = (newStart) => {
    if (newStart !== undefined) {
      const newStartUnix = newStart.unix() * 1000;

      const filteredData = this.state.data.filter(data => {
        return data.date >= newStartUnix && data.date < this.state.endDate;
      });

      this.setState({
        startDate: newStartUnix,
        currentData: filteredData,
      });
      console.log("settin new strt:", this.state);
    }
  }

  changeEndDate = (newEnd) => {
    if (newEnd !== undefined) {
      const newEndUnix = newEnd.unix() * 1000;
      console.log("setting new end:", this.state.endDate);

      const filteredData = this.state.data.filter(data => {
        return data.date >= this.state.startDate && data.date < newEndUnix;
      });

      this.setState({
        endDate: newEndUnix,
        currentData: filteredData,
      });
    }
  }

  disabledDate = (current) => {
    return current < moment(this.state.earliestDate) || current > moment().endOf('day');
  }

  render() {
    return (
      <div>
        <DatePicker
          disabledDate={this.disabledDate}
          onChange={this.changeStartDate}
          format="YYYY-MM-DD" />
        <DatePicker
          disabledDate={this.disabledDate}
          onChange={this.changeEndDate}
          format="YYYY-MM-DD" />
        {// <RangePicker
        //   disabledDate={this.disabledDate}
        //   onCalendarChange={this.changeDateRange}
        //   format="YYYY-MM-DD"
        // />
      }
        <LineChart width={750} height={250} data={this.state.currentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey='date'
                 domain={[this.state.startDate, this.state.endDate]}
                 type='number' style={{fontSize: 12}}
                 ticks={this.state.currentData.map(({date, weight}) => date) }
                 tickFormatter={(tick) => moment(tick).format('DD/MM/YY')}/>
          <YAxis dataKey='weight' type='number' domain={['dataMin - 2', 'dataMax + 2']}/>
          <Tooltip
            formatter={(value) => `${value}kg`}
          />
          <Line type="monotone" dataKey='weight' stroke="#8884d8" />
        </LineChart>
      </div>
    );
  }
}

export default LineWeight;
