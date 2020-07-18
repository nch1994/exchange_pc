import React, { Component, createRef } from 'react';
import styles from './index.less';
import UserIcon from '@/assets/image/user/user.png';
import CodeIcon from '@/assets/image/user/code.png';
import NewPwdIcon from '@/assets/image/user/newPwd.png';
import { showErrorMessage, setCookie, getCookie } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import md5 from 'md5';

import reg from '@/utils/reg';
let timer, timer2 = null;
class SettingFund extends Component {
  constructor (props) {
    super(props);
    this.userRef = createRef();
    this.codeRef = createRef();
    this.pwdRef = createRef();
    this.pwdConfirmRef = createRef();
  };
  state = {
    codeNotice: `${formatMessage({id: 'getCode'})}`,
    disabled: false,
    disabled2: false
  }
  verify() {
    const codeVal = this.codeRef.current.value;
    const pwdVal = this.pwdRef.current.value;
    const pwdVal2 = this.pwdConfirmRef.current.value;
    if (codeVal.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.code.error'})}`);
      return false;
    }
    if (!reg.number.test(pwdVal)){
      showErrorMessage(`${formatMessage({id: 'notice.input.fund.password.error'})}`);
      return false;
    }
    if (pwdVal !== pwdVal2) {
      showErrorMessage(`${formatMessage({id: 'notice.confirm.password.error'})}`);
      return false;
    }
  }
  getCode() {
    const { dispatch } = this.props;
    const country = JSON.parse(getCookie('userInfo')).countryCode; 
    if (this.beforeGetCode() === false) return;
    const number = this.userRef.current.value;
    const countryCode = reg.phone.test(number) ? country : '';
    dispatch({
      type: 'global/sendSMS',
      payload: {
        countryCode,
        number,
      }
    })
  };
  beforeGetCode() {
    let time = 60;
    this.setState({
      disabled: true
    })
    timer = setInterval(() => {
      --time;
      this.setState({
        codeNotice : `${time}s`
      })
      if (time === 0) {
        clearInterval(timer);
        this.setState({
          codeNotice: `${formatMessage({id: 'regainCode'})}`,
          disabled: false
        })
      }
    }, 1000)
  };
  cancle () {
    const { dispatch } = this.props;
    clearInterval(timer);
    clearTimeout(timer2);
    this.codeRef.current.value = '';
    this.pwdRef.current.value = '';
    this.pwdConfirmRef.current.value = '';
    dispatch({
      type: 'fund/hideFund',
      payload: false
    });
    this.setState({
      codeNotice: `${formatMessage({id: 'getCode'})}`,
      disabled: false
    })
  };
  componentWillUnmount() {
    this.cancle();
  }
  submit () {
    if (this.verify() === false) return;
    const { dispatch } = this.props;
    const country = JSON.parse(getCookie('userInfo')).countryCode; 
    const number = this.userRef.current.value;
    const countryCode = reg.phone.test(number) ? country : '';
    const verificationCode = this.codeRef.current.value;
    const newPassword = md5(this.pwdRef.current.value);
    const type = 1; // 0为登录密码； 1为交易密码
    this.setState({
      disabled2: true
    })
    timer2 = setTimeout(() => {
      this.setState({
        disabled2: false
      })
    }, 3000);
    dispatch({
      type: 'fund/resetPassword',
      payload: {newPassword, countryCode, number, type, verificationCode},
      callback: () => {
        dispatch({
          type: 'fund/hideAll'
        })
        let userInfo = JSON.parse(getCookie('userInfo'));
        userInfo.tradePassword = newPassword;
        setCookie('userInfo', JSON.stringify(userInfo));
      }
    })
  };
  render () {
    const userInfo = JSON.parse(getCookie('userInfo'))
    const { codeNotice, disabled2, disabled } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.login}>
          <p className={styles.title}>{formatMessage({id: 'mine.setting.fund.password'})}</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <label><img src={UserIcon} alt="" /></label>
              <input ref={this.userRef} defaultValue={userInfo.mobile || userInfo.email} readOnly />
              <button disabled={disabled} onClick={() => this.getCode()}>{codeNotice}</button>
            </li>
            <li className={styles.listItem}>
              <label><img src={CodeIcon} alt="" /></label>
              <input type="text" placeholder={formatMessage({id: 'input.code'})} ref={this.codeRef} />
            </li>
            <li className={styles.listItem}>
              <label><img src={NewPwdIcon} alt="" /></label>
              <input type="password" placeholder={formatMessage({id: 'input.new.password'})} ref={this.pwdRef} />
            </li>
            <li className={styles.listItem}>
              <label><img src={NewPwdIcon} alt="" /></label>
              <input type="password" placeholder={formatMessage({id: 'input.confirm.new.password'})} ref={this.pwdConfirmRef} />
            </li>
          </ul>
          <div className={styles.btnWrap}>
            <button onClick={this.submit.bind(this)} disabled={disabled2}>{formatMessage({id: 'confirm'})}</button>
            <button onClick={() => this.cancle()}>{formatMessage({id: 'cancel'})}</button>
          </div>
        </div>
      </div>
    );
  }
}


export default connect(({ mine, global }) => ({
  mine, global
}))(SettingFund);