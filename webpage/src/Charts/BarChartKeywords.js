import React, { Component } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import keywordsData from './__keywords'

class BarChartKeywords extends Component {
  constructor() {
    super();
    this.data = keywordsData;
    this.dictionary = {};
    let bannedList = [];

    for (var i in this.data) {
      let obj = this.data[i];
      for (var j in obj.keywords) {
        if (bannedList.includes(obj.keywords[j]))
          break;

        if (!this.dictionary.hasOwnProperty(obj.keywords[j])){
          this.dictionary[obj.keywords[j]] = 1;
        } else {
          this.dictionary[obj.keywords[j]] += 1;
        }
      }
    }

    this.dataSet = Object.entries(this.dictionary)
                   .filter(([key,value]) => value > 5)
                   .map(([key,value]) => ({"name": key, "value": value}));

    this.dataSet.sort((a,b) => {
      return -(a.value - b.value);
    });

    this.dataSet.forEach(({ name, value }) => {
      console.log(name + ": " + value);
    });
  }

  render() {
    return (
      <BarChart width={730} height={250} data={this.dataSet}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{fontSize: 10}}/>
        <YAxis />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    );
  }
}

export default BarChartKeywords;
