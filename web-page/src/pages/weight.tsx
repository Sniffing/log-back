import React from "react";

import LineWeight from "../charts/lineweight";
import { inject } from "mobx-react";
import { RootStore } from "../stores/rootStore";

interface IProps {
  rootStore?: RootStore;
}

@inject("rootstore")
export class WeightPage extends React.Component<IProps> {
  render() {
    return (
      <div className="weight-page">
        <LineWeight rootStore={this.props.rootStore} />
      </div>
    );
  }
}
