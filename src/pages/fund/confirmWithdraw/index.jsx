import React, { Component, createRef } from 'react';
import styles from './index.less';
import close from '@/assets/image/fund/close.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import reg from '@/utils/reg';
import { showErrorMessage, getCookie } from '@/utils/utils';
import md5 from 'md5';

let timer1, timer2, timer3 = null;
class ConfirmWithdraw extends Component {
  constructor (props) {
    super(props);
    this.pwdRef = createRef();
    this.phoneRef = createRef();
    this.emailRef = createRef();
    this.codeRef1 = createRef();
    this.codeRef2 = createRef();
  };
  state = {
    codeNotice1: `${formatMessage({id: 'getCode'})}`,
    codeNotice2: `${formatMessage({id: 'getCode'})}`,
    disabled1: false,
    disabled2: false,
    disabled3: false
  }
  getCode(type) {
    const { dispatch } = this.props;
    if (this.beforeGetCode(type) === false) return;
    let number, countryCode = '';
    const userInfo = JSON.parse(getCookie('userInfo'))
    if (type === 0) {
      number = this.phoneRef.current.value;
      countryCode = userInfo.countryCode
    } else if (type === 1) {
      number = this.emailRef.current.value;
      countryCode = ''
    }
    dispatch({
      type: 'global/sendSMS',
      payload: {
        countryCode,
        number,
      }
    })
  };
  beforeGetCode(type) {
    if (type === 0) {
      let time1 = 60;
      this.setState({
        disabled1: true
      })
      timer1 = setInterval(() => {
        --time1;
        this.setState({
          codeNotice1 : `${time1}s`,
        })
        if (time1 === 0) {
          clearInterval(timer1);
          this.setState({
            codeNotice1: `${formatMessage({id: 'regainCode'})}`,
            disabled1: false
          })
        }
      }, 1000)
    } else {
      let time2 = 60;
      this.setState({
        disabled2: true
      })
      timer2 = setInterval(() => {
        --time2;
        this.setState({
          codeNotice2 : `${time2}s`
        })
        if (time2 === 0) {
          clearInterval(timer2);
          this.setState({
            codeNotice2: `${formatMessage({id: 'regainCode'})}`,
            disabled2: false
          })
        }
      }, 1000)
    }
  };
  verify() {
    const pwdVal = this.pwdRef.current.value;
    const codeVal1 = this.codeRef1.current.value;
    const codeVal2 = this.codeRef2.current.value;
    const userInfo = JSON.parse(getCookie('userInfo'))
    if (codeVal1.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.phone.code.error'})}`);
      return false;
    }
    if (userInfo.emailAuth === 1 && codeVal2.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.email.code.error'})}`);
      return false;
    }
    if (!reg.number.test(pwdVal)){
      showErrorMessage(`${formatMessage({id: 'notice.input.fund.password.error'})}`);
      return false;
    }
  };
  confirm() {
    if (this.verify() === false) return;
    const pwdRefVal = md5(this.pwdRef.current.value);
    const codeVal1 = this.codeRef1.current.value;
    const codeVal2 = this.codeRef2.current.value;
    this.setState({
      disabled3: true
    })
    timer3 = setTimeout(() => {
      this.setState({
        disabled3: false
      })
    }, 3000)
    this.props.onConfirmWithdraw(pwdRefVal, codeVal1, codeVal2);
  };
  componentWillUnmount() {
    this.cancle()
  }
  cancle() {
    const { dispatch } = this.props;
    clearInterval(timer1);
    clearInterval(timer2);
    clearTimeout(timer3)
    this.setState({
      codeNotice: `${formatMessage({id: 'getCode'})}`,
    })
    dispatch({
      type: 'fund/showConfirm',
      payload: false
    });
  };
  render () {
    const userInfo = JSON.parse(getCookie('userInfo'))
    const { codeNotice1, codeNotice2, disabled1, disabled2, disabled3 } = this.state;
    return (
      <div className={styles.mask}>
        <div className={styles.content}>
          <div className={styles.title}>
            <span>{formatMessage({id: 'withdraw'})}</span>
            <img src={close} alt="" onClick={() => this.cancle()}/>
          </div>
          <ul>
            <li>
              <label htmlFor="">{formatMessage({id: 'fund.withdraw.money.password'})}</label>
              <div>
                <input type="password" placeholder={formatMessage({id: 'input.asset.password'})} ref={this.pwdRef} />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'phone'})}</label>
              <div>
                <input type="text" ref={this.phoneRef} value={userInfo.mobile || ''} readOnly />
                <button disabled={disabled1} onClick={() => this.getCode(0)}>{codeNotice1}</button>
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'code'})}</label>
              <div>
                <input type="text" placeholder={formatMessage({id: 'input.phone.code'})} ref={this.codeRef1} />
              </div>
            </li>
            <li style={{display: userInfo.emailAuth === 1 ? 'flex' : 'none'}}>
              <label htmlFor="">{formatMessage({id: 'email'})}</label>
              <div>
                <input type="text" ref={this.emailRef} value={userInfo.email || ''} readOnly />
                <button disabled={disabled2} onClick={() => this.getCode(1)}>{codeNotice2}</button>
              </div>
            </li>
            <li style={{display: userInfo.emailAuth === 1 ? 'flex' : 'none'}}>
              <label htmlFor="">{formatMessage({id: 'code'})}</label>
              <div>
                <input type="text" placeholder={formatMessage({id: 'input.email.code'})} ref={this.codeRef2} />
              </div>
            </li>
          </ul>
          <button className={styles.btn} onClick={() => this.confirm()} disabled={disabled3}>{formatMessage({id: 'confirm'})}</button>
        </div>
      </div>
    )
  }
}

export default connect(({ fund, global }) => ({
  fund, global
}))(ConfirmWithdraw);