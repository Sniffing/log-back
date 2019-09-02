import React, { Component } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import './calendar.css';
import { Select, message } from 'antd';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { RootStore, KeywordEntry } from '../stores/rootStore';

const { Option } = Select;

interface IProps {
  rootStore?: RootStore;
}

@inject('rootStore')
@observer
class CalendarKeyword extends Component<IProps> {
  
@observable
private searchTerm: string =  "";
    
@observable
private dates: any[] = [];

@observable
private dateList: any[] = [];

@observable
private data: any[] = [];

@action
public async componentDidMount() {
    this.searchTerm = "dance";
    if (!this.props.rootStore) {
      return;
    }

    try {
      await this.props.rootStore.fetchKeywords();
      this.parseResults(this.props.rootStore.keywordsData);
    } catch (err) {
      message.error("Could not fetch keywords");
    }
}

@action
public parseResults = (res: KeywordEntry[]) => {
    let dates = [];
    for (var i=0; i < this.data.length; i++) {
      let obj = this.data[i];
      if (obj.keywords.includes(this.searchTerm))
        dates.push(obj.date)
    }

    this.dates = dates;

    this.dates.sort((a,b) => {
      return a.name - b.name
    });

    const dateList = dates.map(d => ({date: d}));
    this.dateList = dateList;
  }

  @action
  private onChange = async (value: any) => {
    if (!this.props.rootStore) {
      return;
    }

    this.searchTerm = value;
    try {
      await this.props.rootStore.fetchKeywords();
      this.parseResults(this.props.rootStore.keywordsData);
    } catch  {
      message.error("Could not search keywords");
    }
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
