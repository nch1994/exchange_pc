import React, { Component } from 'react';
import styles from './index.less';
import close from '@/assets/image/fund/close.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { InputNumber, Tooltip } from 'antd';
import AskIcon from '@/assets/image/ask.png';

class AddFollow extends Component {
  state = {
    wayList: [`${formatMessage({id: 'community.fixed'})}`, `${formatMessage({id: 'community.scale'})}`],
    curIndex: 0,
    value1: 1,
    value2: 20,
    value3: 20000
  }
  componentDidMount() {
  }
  confirm() {
    const { curIndex, value1, value2, value3 } = this.state;
    this.props.onFollowLayer(curIndex, value1, value2, value3);
  };
  changeIdx(index) {
    this.setState({
      curIndex: index
    })
  }
  changeValue1(event) {
    this.setState({
      value1: event
    })
  }
  changeValue2(event) {
    this.setState({
      value2: event
    })
  }
  changeValue3(event) {
    this.setState({
      value3: event
    })
  }
  cancel() {
    this.setState({
      value1: 1,
      value2: 1,
      value3: 20000,
      curIndex: 0
    })
    this.props.onCancel();
  };
  render () {
    const { nickName, contractIdx, global: { contractList } } = this.props;
    const { wayList, curIndex, value1, value2, value3 } = this.state
    return (
      <div className={styles.mask}>
        <div className={styles.content}>
          <div className={styles.title}>
            <span>{formatMessage({id: 'community.follow'})}</span>
            <img src={close} alt="" onClick={() => this.cancel()}/>
          </div>
          <ul>
            <li>
              <label htmlFor="">{formatMessage({id: 'community.nickName'})}</label>
              <div className={styles.default}>
                <input className={styles.input} type="text" value={nickName} readOnly />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'community.types'})}</label>
              <div className={styles.default}>
                <input className={styles.input} type="text" value={contractList[contractIdx].contName + formatMessage({id: 'perpetual'})} readOnly />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'community.ways'})}</label>
              <div className={styles.ways}>
                {
                  wayList.map((item, index) => {
                    return <p key={index} className={curIndex === index ? styles.active: ''} onClick={this.changeIdx.bind(this, index)}>{item}</p>
                  })
                }
              </div>
            </li>
            <li style={{display: curIndex === 0 ? 'flex' : 'none'}}>
              <Tooltip title={formatMessage({id: 'community.amount.notice'})}>
                <label htmlFor="">{formatMessage({id: 'community.amount'})}<img src={AskIcon} className={styles.ask} alt=""/></label>
              </Tooltip>
              <div className={styles.inputNumber}>
                <InputNumber min={1} max={999999} value={value1} parser={value => value.replace(/\D/g,'')} style={{width: '280px'}} onChange={(value) => this.changeValue1(value)} />
              </div>
            </li>
            <li style={{display: curIndex === 1 ? 'flex' : 'none'}}>
              <Tooltip title={formatMessage({id: 'community.unit.notice'})}>
                <label htmlFor="">{formatMessage({id: 'community.unit'})}<img src={AskIcon} className={styles.ask} alt=""/></label>
              </Tooltip>
              <div className={styles.inputNumber}>
                <InputNumber min={1} max={100} value={value2} step="10" formatter={value => `${value}%`} parser={value => value.replace('%', ''), value => value.replace(/\D/g,'')} style={{width: '280px'}} onChange={(value) => this.changeValue2(value)} maxLength={4} />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'community.dailyMax'})}</label>
              <div className={styles.inputNumber}>
                <InputNumber min={1} max={20000} value={value3} style={{width: '280px'}} parser={value => value.replace(/\D/g,'')} onChange={(value) => this.changeValue3(value)} />
              </div>
            </li>
          </ul>
          <button className={styles.btn} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
        </div>
      </div>
    )
  }
}

export default connect(({ follow, global }) => ({
  follow, global
}))(AddFollow);