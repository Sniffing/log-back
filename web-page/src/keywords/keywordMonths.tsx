import React from 'react';
import { observable, computed, keys } from 'mobx';
import ReactMinimalPieChart, { PieChartData, LabelProps } from 'react-minimal-pie-chart'
import { IGenericObject } from '../App.constants';
import { clone, isEmpty } from 'lodash';

interface IProps {
  data: any[];
}

const months = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

const baseMonthWordMap: IGenericObject<IGenericObject<number>> = {
  '01': {},
  '02': {},
  '03': {},
  '04': {},
  '05': {},
  '06': {},
  '07': {},
  '08': {},
  '09': {},
  '10': {},
  '11': {},
  '12': {},    
}

export class KeywordMonths extends React.Component<IProps> {
  @observable
  private yearMonthData: IGenericObject<IGenericObject<IGenericObject<number>>> = {};

  private convertData(data: any[]) {
    data.forEach(datum => {
      const date = datum.date.split('-');
      const year = date[0];

      if(!this.yearMonthData.hasOwnProperty(year)) {
        this.yearMonthData[year] = clone(baseMonthWordMap);
      }

      const month = date[1];
      datum.keywords.forEach((word: string) => {
        if (!this.yearMonthData[year][month].hasOwnProperty(word)) {
          this.yearMonthData[year][month][word] = 0;  
        }
        this.yearMonthData[year][month][word]++;
      });
    });
  }

  public componentWillReceiveProps(newProps: IProps) {
    if (isEmpty(this.yearMonthData) && !isEmpty(newProps.data)) {
      this.convertData(newProps.data);
    }
  }

  private getJoinedMonthData = () => {
    const data: IGenericObject<PieChartData[]> = {
      '01': [],
      '02': [],
      '03': [],
      '04': [],
      '05': [],
      '06': [],
      '07': [],
      '08': [],
      '09': [],
      '10': [],
      '11': [],
      '12': [],    
    };

    keys(this.yearMonthData).forEach((year: any) => {
      keys(this.yearMonthData[year]).forEach((month: any) => {
        keys(this.yearMonthData[year][month]).forEach((word: any) => {
          data[month].push({
            color: '#E38627',
            key: word,
            value: this.yearMonthData[year][month][word],
          })
        });        
      });
    });

    return data['10'];
  }

  private getYearData = () => {
    const data: any[] = [];
    keys(this.yearMonthData).forEach((year: any) => {
      keys(this.yearMonthData[year]).forEach((month: any) => {
        console.log('fic')
      });
    });
  }

  render() {
    const data: PieChartData[] = this.getJoinedMonthData();

    return (
      <ReactMinimalPieChart
        animate={true}
        animationDuration={500}
        animationEasing="ease-out"
        cx={50}
        cy={50}
        data={data}
        label={(lp: LabelProps) => {
          const d = lp.data[lp.dataIndex];
          return `${d.key as string} [${d.value}]`
        }}
        labelPosition={50}
        labelStyle={{
          fill: '#121212',
          fontFamily: 'sans-serif',
          fontSize: '5px'
        }}
        lengthAngle={360}
        lineWidth={100}
        radius={50}
        rounded={false}
        startAngle={0}
        style={{
          height: '400px'
        }}
      />
    )
  }
}