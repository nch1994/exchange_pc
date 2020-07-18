import styles from './index.less';
import React, { Component, createRef } from 'react';
// import { Menu, Dropdown } from 'antd';
import PhoneIcon from '@/assets/image/user/phone.png';
import PwdIcon from '@/assets/image/user/pwd.png';
import BottomIcon from '@/assets/image/bottom_black.png';
import CodeIcon from '@/assets/image/user/code.png';
import EmailIcon from '@/assets/image/user/email.png';
import CheckedIcon from '@/assets/image/check.png';
import { showErrorMessage, aboutUrl } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import reg from '@/utils/reg';
import { connect } from 'dva';
import md5 from 'md5';

let timer, timer2 = null;


class Form extends Component {
  constructor (props) {
    super(props);
    this.phoneRef = createRef();
    this.emailRef = createRef();
    this.verificationCodeRef = createRef();
    this.pwdRef = createRef();
    this.pwdConfirmRef = createRef();
    this.inviteCodeRef = createRef();
    this.state={
      isChecked: false,
      codeNotice: `${formatMessage({id: 'getCode'})}`,
      disabled: false,
      disabled2: false,
      countryCode: 86
    };
  };
  checkAgree () {
    this.setState({
      isChecked: !this.state.isChecked
    })
  };
  verify() {
    const phoneVal = this.phoneRef.current.value;
    const emailVal = this.emailRef.current.value;
    const verificationCodeVal = this.verificationCodeRef.current.value;
    const pwdVal = this.pwdRef.current.value;
    const pwdConfirmVal = this.pwdConfirmRef.current.value;
    const inviteCodeVal = this.inviteCodeRef.current.value;
    const { curIndex } = this.props;
    const { isChecked } = this.state;
    if (curIndex === 0) {
      if (!reg.phone.test(phoneVal)) {
        showErrorMessage(`${formatMessage({id: 'notice.phone'})}`);
        return false;
      }
    } else {
      if (!reg.email.test(emailVal)) {
        showErrorMessage(`${formatMessage({id: 'notice.email'})}`);
        return false;
      }
    }
    if (verificationCodeVal.length < 1){
      showErrorMessage(`${formatMessage({id: 'notice.input.code.error'})}`);
      return false;
    }
    if (!reg.registerNewPassword.test(pwdVal)) {
      showErrorMessage(`${formatMessage({id: 'notice.input.RegisterNewpassword.error'})}`);
      return false;
    }
    if (pwdConfirmVal !== pwdVal) {
      showErrorMessage(`${formatMessage({id: 'notice.confirm.password.error'})}`);
      return false;
    }
    if (inviteCodeVal.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.recommend.code.error'})}`);
      return false;
    }
    if (!isChecked) {
      showErrorMessage(`${formatMessage({id: 'notice.agree'})}`);
      return false;
    }
    
  };
  getCode() {
    const { dispatch, curIndex, global: { country } } = this.props;
    if (this.beforeGetCode() === false) return;
    const number = curIndex === 0 ? this.phoneRef.current.value : this.emailRef.current.value;
    const countryCode = curIndex === 0 ? country : '';
    dispatch({
      type: 'global/sendSMS',
      payload: {
        countryCode,
        number,
      }
    })
  };
  beforeGetCode() {
    const phoneVal = this.phoneRef.current.value;
    const emailVal = this.emailRef.current.value;
    const { curIndex } = this.props;
    if (curIndex === 0) {
      if (!reg.phone.test(phoneVal)) {
        showErrorMessage(`${formatMessage({id: 'notice.phone'})}`);
        return false;
      }
    } else {
      if (!reg.email.test(emailVal)) {
        showErrorMessage(`${formatMessage({id: 'notice.email'})}`);
        return false;
      }
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
    this.setState({
      disabled: false
    })
  };
  submit () {
    if(this.verify() === false) return;
    const { curIndex } = this.props;
    const userVal = curIndex === 0 ? this.phoneRef.current.value : this.emailRef.current.value;
    const pwdVal = md5(this.pwdRef.current.value);
    const verificationCodeVal = this.verificationCodeRef.current.value;
    const inviteCodeVal = this.inviteCodeRef.current.value;
    this.setState({
      disabled2: true
    })
    timer2 = setTimeout(() => {
      this.setState({
        disabled2: false
      })
    }, 3000)
    this.props.onRegister(
      userVal,
      verificationCodeVal,
      pwdVal,
      inviteCodeVal
    )
  };
  changeCountryCode = e => {
    if (e.key === 'item_0') {
      this.setState({
        countryCode: 86
      });
      localStorage.setItem('countryCode', 86)
    } else {
      this.setState({
        countryCode: 351
      })
      localStorage.setItem('countryCode', 351)
    }
  }
  componentDidUpdate(prevProps) {
    const { curIndex } = this.props;
    if (curIndex !== prevProps.curIndex) {
      clearInterval(timer);
      this.setState({
        codeNotice: `${formatMessage({id: 'getCode'})}`,
        disabled: false
      })
    }
  };
  render () {
    const { curIndex, email, phone } = this.props;
    const { isChecked, codeNotice, disabled, disabled2, countryCode } = this.state;
    // const menu = (
    //   <Menu onClick={this.changeCountryCode.bind(this)}>
    //     <Menu.Item>86</Menu.Item>
    //     <Menu.Item>351</Menu.Item>
    //   </Menu>
    // );
    return (
      <div>
        <ul className={styles.list}>
          <li className={`${styles.listItem}`} style={{display: (curIndex === 0) ? "flex" : "none"}}>
            <label><img src={PhoneIcon} alt="" /></label>
            <div className={styles.dropdown}>
              <p className="ant-dropdown-link">
                {countryCode} <img src={BottomIcon} alt="" className={styles.BottomIcon} />
              </p>
            </div>
            <input placeholder={formatMessage({id: 'input.phone'})} className={styles.phoneStyle} defaultValue={phone} ref={this.phoneRef} />
          </li>
          <li className={`${styles.listItem}`} style={{display: (curIndex === 1) ? "flex" : "none"}}>
            <label><img src={EmailIcon} alt="" /></label>
            <input placeholder={formatMessage({id: 'input.email'})} defaultValue={email} ref={this.emailRef} />
          </li>
          <li className={styles.listItem}>
            <label><img src={CodeIcon} alt="" /></label>
            <input placeholder={formatMessage({id: 'input.code'})} ref={this.verificationCodeRef} />
            <button disabled={disabled} onClick={() => this.getCode()}>{codeNotice}</button>
          </li>
          <li className={styles.listItem} >
            <label><img src={PwdIcon} alt="" /></label>
            <input placeholder={formatMessage({id: 'input.password'})} type="password" ref={this.pwdRef}  />
          </li>
          {/* <li className={styles.safe}>
            <div className={styles.safeBg}>
              <div className={styles.safeNum} />
            </div>
            <p>{formatMessage({id: 'user.safe.index'})}：低</p>
          </li> */}
          <li className={styles.listItem}>
            <label><img src={PwdIcon} alt="" /></label>
            <input placeholder={formatMessage({id: 'input.confirm.password'})} type="password" ref={this.pwdConfirmRef} />
          </li>
          <li className={styles.listItem}>
            <label><img src={CodeIcon} alt="" /></label>
            <input placeholder={formatMessage({id: 'input.recommend.code'})} ref={this.inviteCodeRef} />
          </li>
        </ul>
        <div className={styles.checkAgree}>
          <div className={`${styles.checkIcon} ${isChecked ? styles.checked : styles.check}`} onClick={() => this.checkAgree()}>
            <img src={CheckedIcon} alt="" className={`${isChecked ? styles.show : styles.hide}`} />
          </div>
        <p>{formatMessage({id: 'user.agree'})}<a href={`${aboutUrl}/agree.html`} className={styles.userAgree}>{formatMessage({id: 'user.agree.html'})}</a></p>
        </div>
        <button className={styles.btn} onClick={() => this.submit()} disabled={disabled2} >{formatMessage({id: 'register'})}</button>
      </div>
    )
  }
}

Form.defaultProps = {
  curIndex: 0,
  phone: '',
  email: ''
};

export default connect(({ user, global }) => ({
  user, global
}))(Form);
