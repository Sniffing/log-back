import React from 'react';
import { Row, Col, Button } from 'antd';
import { observable, computed } from 'mobx';
import { IGenericObject } from '../App.constants';
import { chunk } from 'lodash';
import { observer } from 'mobx-react';

interface IProps {
  list: any[];
  updateList: (arg: any) => void;
  minCount: number;
}

@observer
class KeywordList extends React.Component<IProps> {
  @observable
  private checkMap: IGenericObject<boolean>  = {};

  @computed
  private get filteredList() {
    if (!this.props.list) return [];
    return this.props.list.filter(item => item.value > this.props.minCount);
  }

  private isChecked = (item: string): boolean => {
    console.log(this.checkMap);
    
    return this.checkMap.hasOwnProperty(item) && this.checkMap[item];
  }

  private toggleCheck = (item: string) => {
    this.checkMap[item] = !this.checkMap[item];
  }

  render() {
    const columns = 4;
    const lists = chunk(this.filteredList, this.filteredList.length / columns);
    console.log(lists);
    
    return(
      <Row gutter={16}> 
        {lists.map(list => (
          <Col span={24/columns}>
            {(list||[]).map((item) => {
              return (
                <Button 
                  type="link"
                  ghost={this.isChecked(item.key)}
                  onClick={() => this.toggleCheck(item.key)}
                >
                  {item.key} - {item.value}
                </Button> 
              )
            })}
        </Col>
        ))
      }
      </Row>
    )
  }
}

export default KeywordList;