import React from "react";
import { Row, Col } from "antd";
import { observable, computed, action } from "mobx";
import { chunk } from "lodash";
import { observer } from "mobx-react";
import { KeywordTag } from "./";

interface IProps {
  list: any[];
  updateList: (arg: any) => void;
  minCount: number;
}

@observer
export class KeywordList extends React.Component<IProps> {
  @observable
  private checkMap: Record<string, boolean> = {};

  @observable
  private originalList: any[] = [];

  @action
  public componentWillReceiveProps(newProps: IProps) {
    if (newProps.list && this.originalList.length === 0) {
      this.originalList = newProps.list;
    }
  }

  @computed
  private get filteredList() {
    if (!this.originalList) return [];
    return this.originalList.filter(item => item.value > this.props.minCount);
  }

  private toggleCheck = (item: string) => {
    this.checkMap[item] = !this.checkMap[item];
    this.props.updateList(item);
  };

  render() {
    const columns = 4;
    const lists = chunk(this.filteredList, this.filteredList.length / columns);
    const hasRemainder = lists.length % columns !== 0;
    const columnWidth = Math.floor(24 / (columns + (hasRemainder ? 1 : 0)));

    return (
      <Row gutter={16}>
        {lists.map(list => (
          <Col span={columnWidth}>
            {(list || []).map(item => {
              return (
                <Row>
                  <KeywordTag onChange={() => this.toggleCheck(item.key)}>
                    {item.key} - {item.value}
                  </KeywordTag>
                </Row>
              );
            })}
          </Col>
        ))}
      </Row>
    );
  }
}
