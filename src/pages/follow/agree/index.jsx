import React, { Component } from 'react';
import styles from './index.less';
import close from '@/assets/image/fund/close.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import CheckedIcon from '@/assets/image/check.png';

class Agree extends Component {
  state = {
    isChecked1: false,
    isChecked2: false,
    isChecked3: false
  }
  confirm() {
    this.props.onAddFollow()
  }
  cancel() {
    this.props.onCancel();
  };
  checkAgree1 () {
    this.setState({
      isChecked1: !this.state.isChecked1
    })
  };
  checkAgree2 () {
    this.setState({
      isChecked2: !this.state.isChecked2
    })
  };
  checkAgree3 () {
    this.setState({
      isChecked3: !this.state.isChecked3
    })
  };
  render () {
    const { isChecked1, isChecked2, isChecked3 } = this.state
    return (
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <p className={styles.title}>
            <span>{formatMessage({id: 'community.followAgree.title'})}</span>
            <img src={close} alt="" onClick={() => this.cancel()}/>
          </p>
          <ul className={styles.mask}>
            <li>
              <p>{formatMessage({id: 'community.followAgree.notice1'})}</p>
              <div className={styles.agreeWrap}>
                <div className={`${styles.checkIcon} ${isChecked1 ? styles.checked : styles.check}`} onClick={() => this.checkAgree1()}>
                  <img src={CheckedIcon} alt="" className={`${isChecked1 ? styles.show : styles.hide}`} />
                </div>
                <p>{formatMessage({id: 'community.followAgree.known'})}</p>
              </div>
            </li>
            <li>
              <p>{formatMessage({id: 'community.followAgree.notice2'})}</p>
              <div className={styles.agreeWrap}>
                <div className={`${styles.checkIcon} ${isChecked2 ? styles.checked : styles.check}`} onClick={() => this.checkAgree2()}>
                  <img src={CheckedIcon} alt="" className={`${isChecked2 ? styles.show : styles.hide}`} />
                </div>
                <p>{formatMessage({id: 'community.followAgree.known'})}</p>
              </div>
            </li>
            <li>
              <p>{formatMessage({id: 'community.followAgree.notice3'})}</p>
              <div className={styles.agreeWrap}>
                <div className={`${styles.checkIcon} ${isChecked3 ? styles.checked : styles.check}`} onClick={() => this.checkAgree3()}>
                  <img src={CheckedIcon} alt="" className={`${isChecked3 ? styles.show : styles.hide}`} />
                </div>
                <p>{formatMessage({id: 'community.followAgree.known'})}</p>
              </div>
            </li>
          </ul>
          <div className={styles.btnWrap}>
            <button className={`${styles.confirm} ${!isChecked1 || !isChecked2 || !isChecked3 ? styles.pointer : ''}`} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
          </div>
        </div>
      </div>
      
    )
  }
}

export default connect(({ follow, global }) => ({
  follow, global
}))(Agree);