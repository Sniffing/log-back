import React, { Component } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip } from 'recharts';
import { DatePicker } from 'antd';
import moment from 'moment';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
const { RangePicker } = DatePicker;

@observer
class LineWeight extends Component {
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


  async componentDidMount() {
    this.callApi()
        .then(res => {
          const reformattedResults = res.map((item: any) => {
              
            return {
              date: Date.parse(item.date),
              weight: parseFloat(item.weight),
            }
          })

          reformattedResults.sort((a: any, b: any) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            return aDate > bDate;
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

//   private changeDateRange = ([newStart, newEnd]) => {
//     if (newStart !== undefined) {
//       this.setState({
//         startDate: newStart.unix() * 1000,
//       });
//       console.log("settin new strt:", this.startDate);
//     }
//     if (newEnd !== undefined) {
//       this.setState({
//         endDate: newEnd.unix() * 1000,
//       });
//       console.log("setting new end:", this.endDate);
//     }

//     const filteredData = this.data
//                                 .filter(data => {
//                                     return data.date >= this.startDate && data.date < this.endDate;
//                                 });
//     this.setState({
//       currentData: filteredData,
//     });
//   }

    private changeStartDate = (newStart: any) => {
    if (newStart !== undefined) {
      const newStartUnix = newStart.unix() * 1000;

      const filteredData = this.data.filter(data => {
        return data.date >= newStartUnix && data.date < this.endDate;
      });

      this.setState({
        startDate: newStartUnix,
        currentData: filteredData,
      });
      console.log("settin new strt:", this.state);
    }
  }

  private changeEndDate = (newEnd: any) => {
    if (newEnd !== undefined) {
      const newEndUnix = newEnd.unix() * 1000;
      console.log("setting new end:", this.endDate);

      const filteredData = this.data.filter(data => {
        return data.date >= this.startDate && data.date < newEndUnix;
      });

      this.setState({
        endDate: newEndUnix,
        currentData: filteredData,
      });
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
