import React, { Component } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip } from 'recharts';
import { DatePicker, message } from 'antd';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import { observable, action, runInAction } from 'mobx';
import { RootStore } from '../stores/rootStore';
const { RangePicker } = DatePicker;

interface IProps {
  rootStore?: RootStore;
}

interface WeightEntry {
  date: string, 
  weight: string,
}

interface FormattedWeightEntry {
  date: number,
  weight: number,
}

@inject('rootStore')
@observer
class LineWeight extends Component<IProps> {
    @observable
    private data: any[] = [];

    @observable
    private startDate: any;

    @observable
    private endDate: any;

    @observable
    private earliestDate: any;

    @observable
    private currentData: any[] = [];

  public constructor(props: IProps) {
    super(props);
    
  }

  public async componentDidMount() {
    if (!this.props.rootStore) {
      return;
    }

    try {
      await this.props.rootStore.fetchWeightData();
      const data = this.props.rootStore.weightData;

      const reformattedResults: FormattedWeightEntry[] = data.map((item: WeightEntry) => {
        const entry: FormattedWeightEntry = {
          date: Date.parse(item.date),
          weight: parseFloat(item.weight),
        }
        return entry;
      })

      reformattedResults.sort((a: FormattedWeightEntry, b: FormattedWeightEntry) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return aDate > bDate ? 1 : -1;
      });

      runInAction(() => {
        this.data = reformattedResults;
        this.currentData = reformattedResults;
        this.startDate = reformattedResults.length ? reformattedResults[0].date : null;
        this.earliestDate = reformattedResults.length ? reformattedResults[0].date : null;
        this.endDate = reformattedResults.length ? reformattedResults[reformattedResults.length - 1].date : null;
      });
    } catch (err) {
      message.error("Could not fetch weight data");
    }
  }

  // @action
//   private changeDateRange = ([newStart, newEnd]) => {
//     if (newStart !== undefined) {
//       this.startDate = newStart.unix() * 1000;
//       console.log("settin new strt:", this.startDate);
//     }
//     if (newEnd !== undefined) {
//       this.endDate = newEnd.unix() * 1000;
//       console.log("setting new end:", this.endDate);
//     }

//     const filteredData = this.data.filter(data => {
//       return data.date >= this.startDate && data.date < this.endDate;
//     });
//     this.currentData = filteredData;
//     });
//   }

    @action
    private changeStartDate = (newStart: any) => {
    if (newStart !== undefined) {
      const newStartUnix = newStart.unix() * 1000;

      const filteredData = this.data.filter(data => {
        return data.date >= newStartUnix && data.date < this.endDate;
      });

      this.startDate = newStartUnix;
      this.currentData = filteredData;

      console.log("settin new strt:", this.state);
    }
  }

  @action
  private changeEndDate = (newEnd: any) => {
    if (newEnd !== undefined) {
      const newEndUnix = newEnd.unix() * 1000;
      console.log("setting new end:", this.endDate);

      const filteredData = this.data.filter(data => {
        return data.date >= this.startDate && data.date < newEndUnix;
      });

      this.endDate = newEndUnix;
      this.currentData = filteredData;
    }
  }

  disabledDate = (current: any) => {
    return current < moment(this.earliestDate) || current > moment().endOf('day');
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
        <LineChart width={750} height={250} data={this.currentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey='date'
                 domain={[this.startDate, this.endDate]}
                 type='number'
                 ticks={this.currentData.map(({date, weight}) => date) }
                 tickFormatter={(tick) => moment(tick).format('DD/MM/YY')}/>
          <YAxis dataKey='weight' type='number' domain={['dataMin - 2', 'dataMax + 2']}/>
          <Tooltip
            formatter={(v,n,props) => { return (moment(props.payload.date).format('DD/MM/YY')) }}
          />
          <Line type="monotone" dataKey='weight' stroke="#8884d8" />
        </LineChart>
      </div>
    );
  }
}

export default LineWeight;
