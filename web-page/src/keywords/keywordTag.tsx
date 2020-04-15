import React from 'react';
import CheckableTag from 'antd/lib/tag/CheckableTag';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

interface IProps {
  onChange?: () => void;
}

@observer
export class KeywordTag extends React.Component<IProps> {
  @observable
  private checked: boolean = true;

  @action
  private handleChange = () => {
    this.checked = !this.checked;

    if (this.props.onChange) {
      this.props.onChange();
    }
  };

  render() {
    return(
      <CheckableTag
        {...this.props}
        checked={this.checked}
        onChange={this.handleChange}
      />
    )
  }
}