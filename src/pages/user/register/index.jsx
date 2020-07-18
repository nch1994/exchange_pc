import styles from './index.less';
import React, { Component } from 'react';
import Link from 'umi/link';
import Form from './form/index';
import { formatMessage } from 'umi/locale';
import { showErrorMessage, setCookie, getCookie, encryptByDES, encryptStr, decryptByDES } from '@/utils/utils';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import router from 'umi/router';

let timer = null;
class Register extends Component  {
  state = {
    curIndex: 0,
    email: '',
    phone: ''
  };
  componentDidMount() {
    const { location: { params } } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId !== '') {
      showErrorMessage(`${formatMessage({id: 'notice.logined'})}`);
      timer = setTimeout(() => {
        router.replace('/');
      }, 2000)
    }
    if (params) {
      this.setState({
        curIndex: parseInt(params.type),
        email: params.email,
        phone: params.phone
      })
    }
  }
  changeIdx (index) {
    this.setState({
      curIndex: index
    })
  };
  componentWillUnmount() {
    clearTimeout(timer);
  }
  handleRegister(number, verificationCode, password, inviteCode) {
    const { dispatch, global: { country } } = this.props;
    const { curIndex } = this.state;
    const countryCode = curIndex === 0 ? country : '';
    dispatch({
      type: 'user/register',
      payload: {countryCode, number, verificationCode, password, inviteCode},
      callback: (obj) => {
        setCookie('token', encryptByDES(`${obj.userId}${encryptStr}`));
        setCookie('userInfo', JSON.stringify(obj));
        router.replace('/')
      }
    })
  };
  render () {
    const { curIndex, email, phone } = this.state;
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'register'})}`}>
        <div className={styles.container}>
          <div className={styles.register}>
            <p className={styles.title}>{formatMessage({id: 'register'})}</p>
            <Link to="/user/login" className={styles.login}>{formatMessage({id: 'login'})}</Link>
            <ul className={styles.changelist}>
              <li className={curIndex === 0 ? `${styles.active}`: ''} onClick={()=>this.changeIdx(0)}>{formatMessage({id: 'user.phone.register'})}</li>
              <li className={curIndex === 1 ? `${styles.active}`: ''} onClick={()=>this.changeIdx(1)}>{formatMessage({id: 'user.email.register'})}</li>
            </ul>
            <Form curIndex={curIndex} email={email} phone={phone} onRegister={this.handleRegister.bind(this)} />
            <div className={styles.notice}>
              {formatMessage({id: 'user.register.notice1'})}<br />{formatMessage({id: 'user.register.notice2'})}
            </div>
          </div>
        </div>
      </DocumentTitle>
    )
  };
}

export default connect(({ user, global }) => ({
  user, global
}))(Register);
