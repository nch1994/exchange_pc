import React, { Component } from 'react';
import styles from './index.less';
import SuccessIcon from '@/assets/image/fund/success.png';
import { formatMessage } from 'umi/locale';

class SucccessWithdraw extends Component {
  confirm() {
    this.props.onSuccessWithdraw();
  };
  render () {
    return (
      <div className={styles.mask}>
        <div className={styles.content}>
          <img src={SuccessIcon} alt=""/>
          <p className={styles.title}>{formatMessage({id: 'fund.withdraw.success'})}</p>
          <p className={styles.subTitle}>{formatMessage({id: 'fund.withdraw.success.subTitle'})}</p>
          <button className={styles.btn} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
        </div>
      </div>
    )
  }
}

export default SucccessWithdraw;