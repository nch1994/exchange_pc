import React, { Component, createRef } from 'react';
import styles from './index.less';
import EmailIcon from '@/assets/image/user/email.png';
import PhoneIcon from '@/assets/image/user/phone.png';
import CodeIcon from '@/assets/image/user/code.png';
import { showErrorMessage, setCookie, getCookie, encryptByDES, encryptStr, decryptByDES } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import router from 'umi/router';

let timer1, timer2, timer3, timer4 = null;
class Verify extends Component {
  constructor (props) {
    super(props);
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
  verify() {
    const codeVal1 = this.codeRef1.current.value;
    const codeVal2 = this.codeRef2.current.value;
    const { user: { verifyInfo } } = this.props;
    if (verifyInfo.mobileAuth === 1 && codeVal1.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.phone.code.error'})}`);
      return false;
    }
    if (verifyInfo.emailAuth === 1 && codeVal2.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.email.code.error'})}`);
      return false;
    }
  }
  getCode(type) {
    const { dispatch, user: { verifyInfo }} = this.props;
    if (this.beforeGetCode(type) === false) return;
    let number, countryCode = '';
    if (type === 0) {
      number = this.phoneRef.current.value;
      countryCode = verifyInfo.countryCode
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
  componentDidMount() {
    const { user: { verifyInfo } } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (Object.keys(verifyInfo).length === 0) {
      router.replace('/user/login');
    }
    if (userId !== '') {
      showErrorMessage(`${formatMessage({id: 'notice.logined'})}`);
      timer4 = setTimeout(() => {
        router.replace('/');
      }, 2000)
    }
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
  cancle () {
    clearInterval(timer1);
    clearInterval(timer2);
    clearTimeout(timer3);
    clearTimeout(timer4);
    this.setState({
      codeNotice1: `${formatMessage({id: 'getCode'})}`,
      codeNotice2: `${formatMessage({id: 'getCode'})}`,
    });
    router.go(-1);
  };
  submit () {
    if (this.verify() === false) return
    const { dispatch, user: { verifyInfo } } = this.props;
    this.setState({
      disabled3: true
    })
    timer3 = setTimeout(() => {
      this.setState({
        disabled3: false
      })
    }, 3000)
    let data = {};
    if (verifyInfo.mobileAuth === 1 && verifyInfo.emailAuth === 1) {
      const email = verifyInfo.email;
      const emailVerificationCode = this.codeRef2.current.value;
      const mobile = verifyInfo.mobile;
      const mobileVerificationCode = this.codeRef1.current.value;
      const countryCode = verifyInfo.countryCode;
      data = { countryCode, email, emailVerificationCode, mobile, mobileVerificationCode };
    } else if (verifyInfo.mobileAuth === 1) {
      const mobile = verifyInfo.mobile;
      const mobileVerificationCode = this.codeRef1.current.value;
      const countryCode = verifyInfo.countryCode;
      data = { countryCode, mobile, mobileVerificationCode };
    } else if (verifyInfo.emailAuth === 1) {
      const email = verifyInfo.email;
      const emailVerificationCode = this.codeRef2.current.value;
      const countryCode = '';
      data = { countryCode, email, emailVerificationCode };
    }
    dispatch({
      type: 'user/loginVerification',
      payload: data,
      callback: () => {
        setCookie('token', encryptByDES(`${verifyInfo.userId}${encryptStr}`));
        setCookie('userInfo', JSON.stringify(verifyInfo));
        router.replace('/')
      }
    })
  };
  componentWillUnmount() {
    clearInterval(timer1);
    clearInterval(timer2);
    clearTimeout(timer3);
    clearTimeout(timer4);
  }
  render () {
    const { user: { verifyInfo } } = this.props;
    const { codeNotice1, codeNotice2, disabled1, disabled2, disabled3 } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.login}>
          <p className={styles.title}>{formatMessage({id: 'login.auth'})}</p>
          <ul className={styles.list}>
            <li className={styles.listItem} style={{display: verifyInfo.mobileAuth === 1 ? 'flex' : 'none'}}>
              <label><img src={PhoneIcon} alt="" /></label>
              <input ref={this.phoneRef} value={verifyInfo.mobile} readOnly />
              <button disabled={disabled1} onClick={() => this.getCode(0)}>{codeNotice1}</button>
            </li>
            <li className={styles.listItem} style={{display: verifyInfo.mobileAuth === 1 ? 'flex' : 'none'}}>
              <label><img src={CodeIcon} alt="" /></label>
              <input type="text" placeholder={formatMessage({id: 'input.phone.code'})} ref={this.codeRef1} />
            </li>
            <li className={styles.listItem} style={{display: verifyInfo.emailAuth === 1 ? 'flex' : 'none'}}>
              <label><img src={EmailIcon} alt="" /></label>
              <input ref={this.emailRef} value={verifyInfo.email} readOnly />
              <button disabled={disabled2} onClick={() => this.getCode(1)}>{codeNotice2}</button>
            </li>
            <li className={styles.listItem} style={{display: verifyInfo.emailAuth === 1 ? 'flex' : 'none'}}>
              <label><img src={CodeIcon} alt="" /></label>
              <input type="text" placeholder={formatMessage({id: 'input.email.code'})} ref={this.codeRef2} />
            </li>
          </ul>
          <div className={styles.btnWrap}>
            <button onClick={this.submit.bind(this)} disabled={disabled3}>{formatMessage({id: 'confirm'})}</button>
            <button onClick={() => this.cancle()}>{formatMessage({id: 'cancel'})}</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(({ user, global }) => ({
  user, global
}))(Verify);