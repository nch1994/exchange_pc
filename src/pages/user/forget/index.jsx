import React, { Component, createRef } from 'react';
import styles from './index.less';
import UserIcon from '@/assets/image/user/user.png';
import CodeIcon from '@/assets/image/user/code.png';
import NewPwdIcon from '@/assets/image/user/newPwd.png';
import router from 'umi/router';
import { showErrorMessage } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import reg from '@/utils/reg';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import md5 from 'md5';
import { getCookie, decryptByDES } from '@/utils/utils';

let timer, timer2, timer3 = null;
class Forget extends Component {
  constructor (props) {
    super(props);
    this.userRef = createRef();
    this.codeRef = createRef();
    this.pwdRef = createRef();
    this.pwdConfirmRef = createRef();
  };
  componentDidMount() {
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId !== '') {
      showErrorMessage(`${formatMessage({id: 'notice.logined'})}`);
      timer2 = setTimeout(() => {
        router.replace('/');
      }, 1000)
    }
  }
  state = {
    codeNotice: `${formatMessage({id: 'getCode'})}`,
    disabled: false,
    disabled2: false
  }
  verify() {
    const userVal = this.userRef.current.value;
    const codeVal = this.codeRef.current.value;
    const pwdVal = this.pwdRef.current.value;
    const pwdVal2 = this.pwdConfirmRef.current.value;
    if (!reg.phone.test(userVal) && !reg.email.test(userVal)) {
      showErrorMessage(`${formatMessage({id: 'notice.input.user'})}`);
      return false;
    }
    if (codeVal.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.code.error'})}`);
      return false;
    }
    if (!reg.registerNewPassword.test(pwdVal)) {
      showErrorMessage(`${formatMessage({id: 'notice.input.RegisterNewpassword.error'})}`);
      return false;
    }
    if (pwdVal !== pwdVal2) {
      showErrorMessage(`${formatMessage({id: 'notice.confirm.password.error'})}`);
      return false;
    }
  };
  getCode() {
    const { dispatch, global: { country } } = this.props;
    if (this.beforeGetCode() === false) return;
    const number = this.userRef.current.value;
    const countryCode = reg.phone.test(number) ? country : '';
    // const signData = getCodeSign(countryCode, number);
    dispatch({
      type: 'global/sendSMS',
      payload: {
        countryCode,
        number,
      }
    })
  };
  beforeGetCode() {
    const userVal = this.userRef.current.value;
    if (!reg.phone.test(userVal) && !reg.email.test(userVal)) {
      showErrorMessage(`${formatMessage({id: 'notice.input.user'})}`);
      return false;
    }
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
  componentWillUnmount() {
    clearInterval(timer);
    clearTimeout(timer2);
    clearTimeout(timer3);
    this.setState({
      disabled: false
    })
  };
  cancle () {
    router.goBack();
    clearInterval(timer);
    clearTimeout(timer2);
    clearTimeout(timer3);
    this.setState({
      disabled: false
    })
  };
  submit () {
    if (this.verify() === false) return
    const { dispatch, global: { country } } = this.props
    const number = this.userRef.current.value;
    const verificationCode = this.codeRef.current.value;
    const newPassword = md5(this.pwdRef.current.value);
    const countryCode = reg.phone.test(number) ? country : '';
    const type = 0; // 0为登录密码； 1为交易密码 
    this.setState({
      disabled2: true
    })
    timer3 = setTimeout(() => {
      this.setState({
        disabled2: false
      })
    }, 3000)
    dispatch({
      type: 'user/resetPassword',
      payload: {countryCode, newPassword, number, type, verificationCode}
    })
  };
  render () {
    const { codeNotice, disabled2, disabled } = this.state;
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'forget'})}`}>
        <div className={styles.container}>
          <div className={styles.login}>
            <p className={styles.title}>{formatMessage({id: 'user.forget'})}</p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <label><img src={UserIcon} alt="" /></label>
                <input placeholder={formatMessage({id: 'input.phone/email'})} ref={this.userRef} />
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
              <button onClick={this.cancle.bind(this)}>{formatMessage({id: 'cancel'})}</button>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({ user, global }) => ({
  user, global
}))(Forget);
