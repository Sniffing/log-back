import React, { Component } from "react";
import { Button, Card, message } from "antd";
import { observable, runInAction, action } from "mobx";
import { observer, inject } from "mobx-react";
import { RootStore, Memory } from "../stores/rootStore";

interface IProps {
  rootStore?: RootStore;
}

@inject("rootStore")
@observer
class MemorySnippet extends Component<IProps> {
  @observable
  private data: Memory[] = [];

  @observable
  private current: any;

  async componentDidMount() {
    if (!this.props.rootStore) {
      return;
    }

    try {
      await this.props.rootStore.fetchMemory();
      runInAction(() => {
        if (!this.props.rootStore) {
          return;
        }

        this.data = this.props.rootStore.memories;
        this.current = this.props.rootStore.memories[0];
      });
    } catch (err) {
      message.error("Could not fetch memory at this time");
    }
  }

  @action
  rollNewMemory = () => {
    var random = Math.random();
    random *= this.data.length - 1;

    console.log(this.data[random]);
    this.current = this.data[random];
  };

  render() {
    return (
      <div>
        <Button type="primary" icon="redo" onClick={this.rollNewMemory}>
          Random Memory
        </Button>

        {this.current ? (
          <Card title={`${this.current.date}`} style={{ width: 300 }}>
            <p>{this.current.text}</p>
          </Card>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export default MemorySnippet;
