import React, { Component } from 'react';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { InputNumber, Select } from 'antd'
const { Option } = Select;

class EditFollow extends Component {
  state = {
    wayList: [`${formatMessage({id: 'community.fixed'})}`, `${formatMessage({id: 'community.scale'})}`],
    curIndex: 0,
    sheet: 0,
    scale: 0,
    dailyMax: 0
  }
  componentDidMount() {
    this.setState({
      sheet: this.props.modifyInfo.sheet
    })
  }
  componentDidUpdate(prevProps) {
    if (prevProps.modifyInfo !== this.props.modifyInfo) {
      this.setState({
        sheet: this.props.modifyInfo.sheet,
        scale: this.props.modifyInfo.scale,
        dailyMax: this.props.modifyInfo.dailyMax,
        curIndex: this.props.modifyInfo.recType - 1
      })
    }
  }
  changeSheet(value) {
    this.setState({
      sheet: value
    })
  }
  changeScale(value) {
    this.setState({
      scale: value
    })
  }
  changeDailyMax(value) {
    this.setState({
      dailyMax: value
    })
  }
  changeIdx(value) {
    this.setState({
      curIndex: value
    })
  }
  confirm() {
    const { sheet, scale, dailyMax, curIndex } = this.state;
    const { modifyInfo, dispatch } = this.props;
    const data = {
      contId: modifyInfo.contId,
      sheet,
      scale,
      dailyMax,
      userId: modifyInfo.userId,
      traderId: modifyInfo.traderId,
      recType: curIndex + 1,
      recId: modifyInfo.recId
    }
    dispatch({
      type: 'follow/modifyFollow',
      payload: data,
      callback: () => {
        this.props.onConfirmModify();
      }
    })
  }
  cancel() {
    this.props.onCancelModify();
  }
  render() {
    const { wayList, curIndex, sheet, scale, dailyMax } = this.state;
    const { titleIdx } = this.props;
    const OptionItem = wayList.map((item, index) => {
      return <Option value={index} key={index}>{ item }</Option>
    })
    
    return (
      <div className={styles.wrap}>
        <div className={styles.title}>
          <p>{formatMessage({id: 'community.follow.info'})}</p>
        </div>
        <ul className={styles.lists}>
          <li>
            <label htmlFor="">{formatMessage({id: 'community.ways'})}</label>
            <Select value={wayList[curIndex]} style={{ width: 180 }} onChange={(e)=>this.changeIdx(e)}>
              {OptionItem}
            </Select>
          </li>
          <li style={{display: curIndex === 0 ? 'flex' : 'none'}}>
            <label htmlFor="">{formatMessage({id: 'community.amount'})}</label>
            <div className={styles.inputNumber}>
              <InputNumber min={1} max={999999} value={sheet} parser={value => value.replace(/\D/g,'')} style={{width: '280px'}} onChange={(value) => this.changeSheet(value)} />
            </div>
          </li>
          <li style={{display: curIndex === 1 ? 'flex' : 'none'}}>
            <label htmlFor="">{formatMessage({id: 'community.unit'})}</label>
            <div className={styles.inputNumber}>
              <InputNumber min={1} max={100} value={scale} step="10" onChange={(value) => this.changeScale(value)} formatter={value => `${value}%`} parser={value => value.replace('%', ''), value => value.replace(/\D/g,'')} style={{width: '280px'}} maxLength={4} />
            </div>
          </li>
          <li>
            <label htmlFor="">{formatMessage({id: 'community.dailyMax'})}</label>
            <div className={styles.inputNumber}>
              <InputNumber min={1} max={20000} value={dailyMax} parser={value => value.replace(/\D/g,'')} onChange={(value) => this.changeDailyMax(value)} style={{width: '280px'}} />
            </div>
          </li>
        </ul>
        <div className={styles.btnWrap} style={{display: titleIdx === 0 ? 'flex' : 'none'}}>
          <button className={`${styles.btn} ${styles.confirm}`} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
        </div>
        <div className={styles.btnWrap} style={{display: titleIdx === 1 ? 'flex' : 'none'}}>
          <button className={`${styles.btn} ${styles.confirm}`} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
          <button className={`${styles.btn} ${styles.cancel}`} onClick={() => this.cancel()}>{formatMessage({id: 'cancel'})}</button>
        </div>
      </div>
    )
    
  }
}


export default connect(({ follow, global }) => ({
  follow, global
}))(EditFollow);