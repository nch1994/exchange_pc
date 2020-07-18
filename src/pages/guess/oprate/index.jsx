import styles from './index.less';
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import trendDown from '@/assets/image/trend_down2.png';
import trendUp from '@/assets/image/trend_up2.png';
import { Modal } from 'antd';
import { showErrorMessage, decryptByDES, getCookie, filterPoint } from '@/utils/utils';
import router from 'umi/router';

class Oprate extends Component {
  state = {
    sheet: 0,
    showModal: false,
    type: 1
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  handleOk() {
    const { sheet, type } = this.state;
    this.setState({
      showModal: false
    }, () => {
      this.props.onEntrust(type, sheet);
    })
  }
  handleCancel() {
    this.setState({
      showModal: false
    })
  }
  addEntrust(type) {
    const userId = decryptByDES(getCookie('token')) || '';
    const { optionIdx, guess: { optionList } } = this.props;
    if (userId === '') {
      router.push('/user/login');
      return;
    }
    if (optionList[optionIdx].contSwitch === 0) {
      showErrorMessage(formatMessage({id: 'close'}))
      return;
    }
    const { sheet } = this.state;
    if (!parseFloat(sheet)) {
      showErrorMessage(`${formatMessage({id: 'notice.guess.sheet'})}`);
      return false;
    }
    this.setState({
      type: type,
      showModal: true
    })
  }
  changeCount(event) {
    event.target.value = event.target.value.replace(/\D/g,'');
    const { maxSheet } = this.props;
    this.setState({
      sheet: event.target.value > maxSheet ? maxSheet : event.target.value
    })
  }
  minus() {
    let { sheet } = this.state;
    if (sheet <= 0) return;
    sheet = parseInt(sheet) - 1
    this.setState({
      sheet: sheet
    })
  }
  add() {
    let { sheet } = this.state;
    if (sheet === '') sheet = 0;
    const { maxSheet } = this.props;
    if (sheet >= maxSheet) return;
    sheet = parseInt(sheet) + 1
    this.setState({
      sheet: sheet
    })
  }
  toTransfer() {
    const { guess: { optionList }, optionIdx, dispatch } = this.props;
    const transferInfo = {
      transfer: 1,
      coinType: optionList[optionIdx].coinId,
      contId: optionList[optionIdx].contId
    }
    sessionStorage.setItem('transferInfo', JSON.stringify(transferInfo))
    dispatch({
      type: 'global/changeFundActiveIdx',
      payload: 2
    })
    router.push('/fund/transfer');
    
  }
  render() {
    const { sheet, showModal, type } = this.state;
    const { maxSheet, addTime1, addTime2, addTime3, optionIdx, cycleList, cycleIdx, guess: { optionList } } = this.props;
    const title = `${formatMessage({id: 'guess.buy.notice'})}BTC ${addTime1} ${type === 1 ? formatMessage({id: 'trading.center.rise'}) : formatMessage({id: 'trading.center.fall'})}${formatMessage({id: 'guess.option'})}`;
    const placeholder = optionIdx === 0 ? `${cycleList[cycleIdx].usdt}/${optionList[optionIdx].coinName}` : `${cycleList[cycleIdx].eth}/${optionList[optionIdx].coinName}`
    const sheetValue = optionList[optionIdx].coinName === 'USDT' ? cycleList[cycleIdx].usdt : cycleList[cycleIdx].eth;
    return (
      <div className={styles.form}>
        <label htmlFor="" className={styles.title}>{formatMessage({id: 'guess.form.cycle'})}</label>
        <p className={styles.cycle}><span>{addTime1}</span>{formatMessage({id: 'guess.form.to'})}<span>{addTime2}</span></p>
        <label htmlFor="" className={styles.title}>{formatMessage({id:'guess.form.sheet'})}({formatMessage({id: 'guess.form.max'})}{maxSheet}{formatMessage({id: 'guess.form.unit'})})</label>
        <p className={styles.unit}><input placeholder={placeholder} value={sheet === 0 ? '' : sheet} onChange={this.changeCount.bind(this)} /><span>{formatMessage({id: 'guess.form.unit'})}</span></p>
        <div className={styles.inputNumber}>
          <span className={`${ sheet <= 0 ? styles.disabled : '' }`} onClick={this.minus.bind(this)}>-</span>
          <p className={styles.input}>{sheet === '' ? 0 : sheet}</p>
          <span className={`${ sheet >= maxSheet ? styles.disabled : '' }`} onClick={this.add.bind(this)}>+</span>
        </div>
        <p className={styles.notice} onClick={this.toTransfer.bind(this)}>{formatMessage({id: 'guess.banlance'})}</p>
        <button className={`${styles.btn} ${styles.green}`} onClick={this.addEntrust.bind(this, 1)}><img src={trendUp} alt="" />{formatMessage({id: 'trading.center.rise'})}</button>
        <button className={`${styles.btn} ${styles.red}`} onClick={this.addEntrust.bind(this, 0)}><img src={trendDown} alt="" />{formatMessage({id: 'trading.center.fall'})}</button>
        <div>
          <Modal title={title} width='390px' className={styles.guessModal} visible={showModal} centered={true} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
            <p>{addTime1}:00 - {addTime3}:59{formatMessage({id: 'guess.duration'})}</p>
            <p>{formatMessage({id: 'guess.up'})} {type === 1 ? filterPoint(parseInt(sheet)*parseFloat(sheetValue)*0.1, 2) : `-${filterPoint(parseInt(sheet)*parseFloat(sheetValue)*0.1, 2)}`} {optionList[optionIdx].coinName}</p>
            <p>{formatMessage({id: 'guess.down'})} {type === 1 ? `-${filterPoint(parseInt(sheet)*parseFloat(sheetValue)*0.1, 2)}` : filterPoint(parseInt(sheet)*parseFloat(sheetValue)*0.1, 2)} {optionList[optionIdx].coinName}</p>
            <p>{formatMessage({id: 'guess.flat'})} 0.00 {optionList[optionIdx].coinName}</p>
          </Modal>
        </div>
      </div>
    )
  }
}

export default withRouter(connect(({ guess, global }) => ({
  guess, global
}))(Oprate));

