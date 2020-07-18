import React, { Component } from "react";
import styles from './index.less';
import CloseIcon from '@/assets/image/fund/close.png';
import QRCode from 'qrcode.react';

class Qrcode extends Component {
  closeCode () {
    this.props.onCloseCode(); 
  };
  render () {
    const { code } = this.props;
    return (
      <div className={styles.codeWrap}>
        <div className={styles.codeInner}>
          <img src={CloseIcon} className={styles.closeIcon} alt="" onClick={() => this.closeCode()} />
          <QRCode value={code} className={styles.addressCode} size={180}  />
        </div>
      </div>
    )
  }
}

Qrcode.defaultProps = {
  code: ''
}
export default Qrcode