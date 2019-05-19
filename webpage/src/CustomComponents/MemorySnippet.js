import React, { Component } from 'react'
import { Button, Card } from 'antd'

class MemorySnippet extends Component {
  state = {
    data: [],
    current: {},
  };

  async componentDidMount() {
    this.callApi()
      .then(res => {
        this.setState({data:res});
        this.setState({current: res[0]});
      })
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('http://localhost:3000/text');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  rollNewMemory = () => {
    var random = Math.random();
    random *= this.state.data.length - 1;
    random = parseInt(random, 10);

    console.log(this.state.data[random]);
    this.setState({current: this.state.data[random]});
  }

  render() {

    return (
      <div>
        <Button
          type="primary"
          icon="redo"
          onClick={this.rollNewMemory}
        >
          Random Memory
        </Button>

        <Card
          title={`${this.state.current.date}`}
          style={{ width: 300 }}
        >
          <p>{this.state.current.text}</p>
        </Card>
      </div>
    );
  }
}

export default MemorySnippet
