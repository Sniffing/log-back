import React, { Component } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import './calendar.css';
import { Select } from 'antd';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';

const { Option } = Select;

@observer
class CalendarKeyword extends Component {
  
@observable
private searchTerm: string =  "";
    
@observable
private dates: any[] = [];

@observable
private dateList: any[] = [];

@observable
private data: any[] = [];

public async componentDidMount() {
    this.setState({searchTerm: "dance"});
    this.callApi()
        .then(res => {
        this.parseResults(res)
        })
        .catch(err => console.log(err));
}

@action
public parseResults = (res: any) => {
    this.dates = res;
    let dates = [];
    for (var i=0; i < this.data.length; i++) {
      let obj = this.data[i];
      if (obj.keywords.includes(this.searchTerm))
        dates.push(obj.date)
    }

    this.setState({dates: dates});

    this.dates.sort((a,b) => {
      return a.name - b.name
    });

    const dateList = dates.map(d => ({date: d}));
    this.setState({dateList: dateList, count: 1});
  }

  public callApi = async () => {
    const response = await fetch('http://localhost:3000/keywords');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  private onChange = (value: any) => {
    this.setState({searchTerm: value});
    this.callApi()
      .then(res => {
        this.parseResults(res)
      })
      .catch(err => console.log(err));
  }

  public render() {
      return(
        <div>
          <p> Days of {this.searchTerm}: </p>
          <p> {this.dateList.length}/{this.data.length}</p>

          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select a keyword"
            optionFilterProp="children"
            onChange={this.onChange}
            // filterOption={(input, option) => option.props ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false}
          >
            <Option value="dance">Dance</Option>
            <Option value="sick">Sick</Option>
            <Option value="lonely">Lonely</Option>
            <Option value="happy">Happy</Option>
            <Option value="sad">Sad</Option>
            <Option value="overate">Overate</Option>
          </Select>

          <CalendarHeatmap
            startDate={new Date(this.dates[0]) || new Date()}
            endDate={new Date(this.dates[this.dates.length-1]) || new Date()}
            weekdayLabels={['S','M','T','W','T','F','S']}
            showWeekdayLabels={true}
            values={this.dateList}
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
