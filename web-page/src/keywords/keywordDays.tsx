import React from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { IGenericObject } from '../App.constants';
import Heap from 'heap';
import { WordCount } from './keyword.interfaces';

interface IProps {
  data: any[];
  dictionary: WordCount[];
}

const DAYS: IGenericObject<string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
}

const bars: number = 5;

@observer
export class KeywordDays extends React.Component<IProps> {
  @computed
  private get dataByDay() {
    if (!this.props.data || !this.props.data.length) return [];

    const firstEntry = this.props.data[0];
    const firstDate: Date = new Date (Date.parse(firstEntry.date));

    const groupedData: IGenericObject<number>[] = [{},{},{},{},{},{},{}];

    let day = firstDate.getUTCDay();
    for(let i=0; i<this.props.data.length; i++) {
      const data = this.props.data[i];
      const dayNumber = day % 7;
      data.keywords.forEach((word: string) => {
        if (groupedData[dayNumber].hasOwnProperty(word) && groupedData[dayNumber][word]) {
          groupedData[dayNumber][word] += 1;
        } else {
          groupedData[dayNumber][word] = 1;
        }
      });

      day++;
    }

    return groupedData;
  } 

  render() {
    const data = [];
    for (let i: number=0; i<this.dataByDay.length; i++) {
      const day = this.dataByDay[i];
      data.push({
        day: DAYS[i.toString()],
        ...day,
      })
    };

    return (
      <BarChart width={730} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        {
          Heap.nlargest(this.props.dictionary, bars).map(word => {
            return <Bar dataKey={word.key} fill="#8884d8" />
          })
        }
      </BarChart>
    )
  }
}