import React, { Component } from "react";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  LineSeriesPoint,
  VerticalGridLines,
  Crosshair,
  DiscreteColorLegend
} from "react-vis";
import { DatePicker, message, Card, Slider } from "antd";
import moment from "moment";
import { observer, inject } from "mobx-react";
import { observable, action, runInAction, computed } from "mobx";
import { RootStore } from "../stores/rootStore";
import { PacmanLoader } from "react-spinners";
import { Utils } from "../App.utils";
import regression, { Result } from "regression";
import { SliderValue } from "antd/lib/slider";

interface IProps {
  rootStore?: RootStore;
}

interface WeightEntry {
  date: string;
  weight: string;
}

interface FormattedWeightEntry {
  date: number;
  weight: number;
}

@inject("rootStore")
@observer
class LineWeight extends Component<IProps> {
  @observable
  private data: FormattedWeightEntry[] = [];

  @observable
  private startDate: number = 0;

  @observable
  private endDate: number = 0;

  @observable
  private earliestDate: number = 0;

  @observable
  private currentData: FormattedWeightEntry[] = [];

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

      const reformattedResults: FormattedWeightEntry[] = data.map(
        (item: WeightEntry) => {
          const entry: FormattedWeightEntry = {
            date: Date.parse(item.date),
            weight: parseFloat(item.weight)
          };
          return entry;
        }
      );

      reformattedResults.sort(
        (a: FormattedWeightEntry, b: FormattedWeightEntry) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          return aDate > bDate ? 1 : -1;
        }
      );

      runInAction(() => {
        this.data = reformattedResults;
        this.currentData = reformattedResults;
        this.startDate = reformattedResults.length
          ? reformattedResults[0].date
          : -1;
        this.earliestDate = reformattedResults.length
          ? reformattedResults[0].date
          : -1;
        this.endDate = reformattedResults.length
          ? reformattedResults[reformattedResults.length - 1].date
          : -1;
      });
    } catch (err) {
      message.error("Could not fetch weight data");
    }
  }

  @computed
  private get graphData() {
    return this.data.map(d => {
      const entry: LineSeriesPoint = {
        x: d.date,
        y: d.weight
      };
      return entry;
    });
  }

  @computed
  private get lineOfBestFit() {
    const base = this.data[0];
    const line: Result = regression.polynomial(
      this.data.map(d => {
        return [d.date - base.date, d.weight];
      }),
      {
        order: this.fitCloseness,
        precision: 75
      }
    );

    const answer = line.points.map(point => {
      return {
        x: point[0] + base.date,
        y: point[1]
      };
    });
    return answer;
  }

  @computed
  private get averageWeight() {
    return this.data.length
      ? this.data.map(d => d.weight).reduce((acc, item) => acc + item) /
          this.data.length
      : 0;
  }

  @computed
  private get average() {
    return this.data.length > 0
      ? [
          {
            x: this.data[0].date,
            y: this.averageWeight
          },
          {
            x: this.data[this.data.length - 1].date,
            y: this.averageWeight
          }
        ]
      : [];
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
  };

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
  };

  disabledDate = (current: any) => {
    return (
      current < moment(this.earliestDate) || current > moment().endOf("day")
    );
  };

  @computed
  private get finishedLoading() {
    if (!this.props.rootStore) {
      return false;
    } else {
      return !this.props.rootStore.isFetchingData;
    }
  }

  @observable
  private crosshairValues: any[] = [];

  @observable
  private fitCloseness: number = 4;

  @action
  private handlePrecisionChange = (value: SliderValue) => {
    this.fitCloseness = typeof value === "number" ? value : 4;
  };

  render() {
    return (
      <>
        <p>{this.finishedLoading && "This is your weight over time!"}</p>

        {!this.finishedLoading && (
          <div
            style={{
              height: "100%",
              width: "100%"
            }}
          >
            <Card className="loading-card">
              <div style={{ marginBottom: "10px" }}>
                Fetching weight data...
              </div>
              <PacmanLoader color={"#1E78AA"} size={30} />
            </Card>
          </div>
        )}

        {this.finishedLoading && (
          <>
            <Slider
              min={2}
              max={7}
              range={false}
              onChange={this.handlePrecisionChange}
              value={this.fitCloseness}
            />
            <DatePicker
              disabledDate={this.disabledDate}
              onChange={this.changeStartDate}
              format="YYYY-MM-DD"
            />
            <DatePicker
              disabledDate={this.disabledDate}
              onChange={this.changeEndDate}
              format="YYYY-MM-DD"
            />
            {
              // <RangePicker
              //   disabledDate={this.disabledDate}
              //   onCalendarChange={this.changeDateRange}
              //   format="YYYY-MM-DD"
              // />
            }
            <XYPlot xType="time" width={800} height={300}>
              <HorizontalGridLines />
              <VerticalGridLines />
              <LineSeries
                color="red"
                data={this.graphData}
                onNearestXY={(dataPoint, { index }) => {
                  runInAction(() => (this.crosshairValues = [dataPoint]));
                }}
                onSeriesMouseOut={() => {
                  runInAction(() => (this.crosshairValues = []));
                }}
              />
              <XAxis title="Date" />
              <YAxis title="Weight (kg)" />
              <Crosshair
                values={this.crosshairValues}
                titleFormat={(d: LineSeriesPoint) => ({
                  title: "Date",
                  value: Utils.unixTimeToDate(d[0].x)
                })}
                itemsFormat={(d: LineSeriesPoint) => [
                  { title: "Weight", value: d[0].y.toFixed(1) }
                ]}
              />
              <LineSeries
                color="blue"
                data={this.lineOfBestFit}
                onNearestXY={(dataPoint, { index }) => {
                  runInAction(() => (this.crosshairValues = [dataPoint]));
                }}
                onSeriesMouseOut={() => {
                  runInAction(() => (this.crosshairValues = []));
                }}
              />
              <LineSeries color="green" data={this.average} />
            </XYPlot>
            <DiscreteColorLegend
              orientation={"vertical"}
              onItemClick={() => {}}
              items={[
                {
                  title: `Average Weight: ${this.averageWeight.toFixed(1)}kg`,
                  color: "green"
                },
                { title: "Weight", color: "red" },
                { title: "Trend Weight", color: "blue" }
              ]}
            />
          </>
        )}
      </>
    );
  }
}

export default LineWeight;
