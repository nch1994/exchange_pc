import React, { Component } from 'react';
function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}
let timer = null;
class CountDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minute: '00',
      second: '00'
    }
  }
  componentDidMount() {
    this.tick();
  }
  componentDidUpdate(prevProps) {
    if (this.props.target !== prevProps.target) {
      if (timer) clearInterval(timer)
    }
  }
  tick() {
    let { target } = this.props;
    timer = setInterval(() => {
      target = target - 1;
      this.setState({
        minute: fixedZero(`${parseInt(target / 60) <= 0 ? 0 : parseInt(target / 60)}`),
        second: fixedZero(`${target % 60 <= 0 ? 0 : target % 60}`)
      }, () => {
        if (target <= 0) {
          clearInterval(timer);
        }
      })
    }, 1000)
  }
  componentWillUnmount() {
    clearInterval(timer);
  }
 
  render() {
    const { minute, second } = this.state;
    return (<span>{minute}:{second}</span>)
  }
}
 
export default CountDown;