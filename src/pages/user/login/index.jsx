import React, { Component, createRef } from 'react';
import styles from './index.less';
import UserIcon from '@/assets/image/user/user.png';
import PwdIcon from '@/assets/image/user/pwd.png';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import reg from '@/utils/reg';
import { showErrorMessage, setCookie, encryptByDES, encryptStr } from '@/utils/utils';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import md5 from 'md5';
import router from 'umi/router';
import { getCookie, decryptByDES } from '@/utils/utils'

let timer, timer2 = null;
class Login extends Component {
  constructor (props) {
    super(props);
    this.userRef = createRef();
    this.pwdRef = createRef();
  };
  state = {
    disabled: false
  }
  componentDidMount() {
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId !== '') {
      showErrorMessage(`${formatMessage({id: 'notice.logined'})}`);
      timer = setTimeout(() => {
        router.replace('/');
      }, 1000)
    }
  }
  verify() {
    const userVal = this.userRef.current.value;
    const pwdVal = this.pwdRef.current.value;
    if (userVal.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.input.user'})}`);
      return false;
    }
    if (pwdVal.length < 1){
      showErrorMessage(`${formatMessage({id: 'notice.input.password.empty'})}`);
      return false;
    }
  }
  submit () {
    if (this.verify() === false) return
    const number = this.userRef.current.value;
    const password = md5(this.pwdRef.current.value);
    const { dispatch, global: { country } } = this.props;
    const countryCode = reg.email.test(number) ? '' : country;
    this.setState({
      disabaled: true
    })
    timer2 = setTimeout(() => {
      this.setState({
        disabaled: false
      })
    }, 3000)
    dispatch({
      type: 'user/login', 
      payload: {countryCode, number, password},
      callback: (obj) => {
        setCookie('token', encryptByDES(`${obj.userId}${encryptStr}`));
        setCookie('userInfo', JSON.stringify(obj));
        router.replace('/')
      }
    })
  };
  componentWillUnmount() {
    clearTimeout(timer)
    clearTimeout(timer2)
  }
  render () {
    const { disabled } = this.state;
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'login'})}`}>
        <div className={styles.container} >
          <div className={styles.login}>
            <p className={styles.title}>{formatMessage({id: 'login'})}</p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <label><img src={UserIcon} alt="" /></label>
                <input type="text" placeholder={formatMessage({id: 'input.phone/email'})} ref={this.userRef} />
              </li>
              <li className={styles.listItem}>
                <label><img src={PwdIcon} alt="" /></label>
                <input type="password" placeholder={formatMessage({id: 'input.password'})} ref={this.pwdRef} />
              </li>
            </ul>
            <div className={styles.notice}>
              <p>{formatMessage({id: 'user.noAccount'})}？</p>
              <p><Link to="/user/register" className={styles.linkUrl}>{formatMessage({id: 'register'})}</Link><Link to="/user/forget" className={styles.linkUrl}>{formatMessage({id: 'user.forget'})}？</Link></p>
            </div>
            <button className={styles.btn} onClick={this.submit.bind(this)} disabled={disabled}>{formatMessage({id: 'login'})}</button>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({ global }) => ({
  global,
}))(Login);