import React, { Component } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

class CalendarHeatMap extends Component {
  state = {
    searchTerm: "",
    dates: [],
    data: []
  };

  async componentDidMount() {
    this.setState({searchTerm: "happy"});
    this.callApi()
      .then(res => {
        this.setState({data:res});
        console.log(this.state)
        for (var i=0; i < this.state.data.length; i++) {
          let obj = this.state.data[i];
          for (var j=0; j < obj.keywords.length; j++) {
            console.log("keyword", obj.keywords[j])
            if (obj.keywords[j] === this.state.searchTerm)
              this.setState({dates: this.state.dates.push({'date': obj.date, 'count': 1})});
          }
        }

        this.state.dates.sort((a,b) => {
          return a.name - b.name
        });

        console.log("state", this.state)
      })
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/keywords');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
      return(
        <CalendarHeatmap
          // startDate={this.dates[0].name || new Date()}
          // endDate={this.dates[this.dates.length-1].name || new Date()}
          showWeekdayLabels={true}
          values={this.state.dates}
          classForValue={(value) => {
            if (!value) {
              return 'color-empty';
            }
            return `color-scale-${value.count}`;
          }}
        />
      );
  }
}

export default CalendarHeatMap;
