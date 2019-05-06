import React, { Component } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import './calendar.css';
import { Select } from 'antd';

const Option = Select.Option;

class CalendarKeyword extends Component {
  state = {
    searchTerm: "",
    dates: [],
    dateList: [],
    data: [],
  };

  async componentDidMount() {
    this.setState({searchTerm: "dance"});
    this.callApi()
      .then(res => {
        this.parseResults(res)
      })
      .catch(err => console.log(err));
  }

  parseResults = (res) => {
    this.setState({data:res});
    let dates = [];
    for (var i=0; i < this.state.data.length; i++) {
      let obj = this.state.data[i];
      if (obj.keywords.includes(this.state.searchTerm))
        dates.push(obj.date)
    }

    this.setState({dates: dates});

    this.state.dates.sort((a,b) => {
      return a.name - b.name
    });

    const dateList = dates.map(d => ({date: d}));
    this.setState({dateList: dateList, count: 1});
  }

  callApi = async () => {
    const response = await fetch('http://localhost:3000/keywords');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  onChange = (value) => {
    this.setState({searchTerm: value});
    this.callApi()
      .then(res => {
        this.parseResults(res)
      })
      .catch(err => console.log(err));
  }

  render() {
      return(
        <div>
          <p> Days of {this.state.searchTerm}: </p>
          <p> {this.state.dateList.length}/{this.state.data.length}</p>

          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select a keyword"
            optionFilterProp="children"
            onChange={this.onChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            <Option value="dance">Dance</Option>
            <Option value="sick">Sick</Option>
            <Option value="lonely">Lonely</Option>
            <Option value="happy">Happy</Option>
            <Option value="sad">Sad</Option>
            <Option value="overate">Overate</Option>
          </Select>

          <CalendarHeatmap
            startDate={new Date(this.state.dates[0]) || new Date()}
            endDate={new Date(this.state.dates[this.state.dates.length-1]) || new Date()}
            weekdayLabels={['S','M','T','W','T','F','S']}
            showWeekdayLabels={true}
            values={this.state.dateList}
            classForValue={(value) => {
              if (!value) {
                return 'color-empty';
              }
              return 'color-filled';
            }}
          />
        </div>
      );
  }
}

export default CalendarKeyword;
