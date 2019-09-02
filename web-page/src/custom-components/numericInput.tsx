//Copied and pasted from antdesign example
import { Input, Tooltip } from 'antd';
import React, { Component } from 'react';

interface IProps {
    onChange: any;
    value?: number;
}

class NumericInput extends Component<IProps> {
  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numValue = parseInt(value);
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!Number.isNaN(numValue) && reg.test(value)) || value === '' || value === '-') {
      this.props.onChange(numValue);
    }
  }

  render() {

    return (
      <Tooltip
        trigger={"focus"}
        placement="topLeft"
        overlayClassName="numeric-input"
      >
        <Input
          {...this.props}
          onChange={this.onChange}
          placeholder="Entry count cutoff"
          maxLength={5}
        />
      </Tooltip>
    );
  }
}

export default NumericInput;
