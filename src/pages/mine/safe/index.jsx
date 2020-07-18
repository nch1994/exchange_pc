import React, { Component } from "react";
import styles from './index.less';
import SafeIcon1 from '@/assets/image/mine/safe01.png';
import SafeIcon2 from '@/assets/image/mine/safe02.png';
import SafeIcon3 from '@/assets/image/mine/safe03.png';
import SafeIcon4 from '@/assets/image/mine/safe04.png';
import SafeIcon5 from '@/assets/image/mine/safe05.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { getCookie, setCookie, decryptByDES, removeCookie } from '@/utils/utils';
import Link from 'umi/link';
import router from 'umi/router';

import { Switch } from 'antd';
class Safe extends Component {
  state = {
    mobileAuth: 0,
    emailAuth: 0
  };
  switch (type, checked) {
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }

    let userInfo = JSON.parse(getCookie('userInfo'));
    if (type === 0) {
      dispatch({
        type: 'global/updateEmailAuth',
        payload: { userId },
        callback: (obj) => {
          userInfo.emailAuth = obj.emailAuth;
          setCookie('userInfo', JSON.stringify(userInfo));
          this.forceUpdate();
        }
      })
    } else if (type === 1) {
      dispatch({
        type: 'global/updateMobileAuth',
        payload: { userId },
        callback: (obj) => {
          userInfo.mobileAuth = obj.mobileAuth;
          setCookie('userInfo', JSON.stringify(userInfo));
          this.forceUpdate();
        }
      })
    }
  };
  modify (type) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mine/showModify',
    })
    dispatch ({
      type: 'mine/layerType',
      payload: type
    })
  }
  setting(type) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mine/showForget',
    })
    dispatch ({
      type: 'mine/layerType',
      payload: type
    })
    dispatch({
      type: 'mine/actionType',
      payload: 'setting'
    })
  }
  showBind(type) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mine/showBinding',
      payload: type
    })
  }
  render () {
    const userInfo = JSON.parse(getCookie('userInfo'));
    const { mobileAuth, emailAuth } = userInfo;
    let mobile = '';
    if (userInfo.mobile) {
      mobile = userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return (
      <div className={styles.safeWrap}>
        <div className={styles.safeTop}>
          <div className={styles.safeTopTitle}>
            <div>
              <span className={styles.title}>{formatMessage({id: 'mine.safe.setting'})}</span>
              <span className={styles.line}></span>
            </div>
          </div>
          <ul className={styles.list}>
            <li>
              <img src={SafeIcon5} alt=""/>
              <div className={styles.listDiv}>
                <p className={styles.left}>
                  {formatMessage({id: 'mine.id.verification'})}
                  <span style={{display: userInfo.front ? 'none' : 'inline'}}>{formatMessage({id: 'notice.id.validation'})}</span>
                </p>
                <div className={styles.right}>
                  <span style={{display: userInfo.front ? 'block' : 'none', color: '#818DA4', cursor: 'default' }}>{formatMessage({id: 'hasAuth'})}</span>
                  <Link to="/auth" style={{display: userInfo.front ? 'none' : 'block', color: '#007AFF'}}>{formatMessage({id: 'goAuth'})}</Link>
                </div>
              </div>
            </li>
            <li>
              <img src={SafeIcon1} alt=""/>
              <div className={styles.listDiv}>
                <p className={styles.left}>{formatMessage({id: 'mine.money.password'})}</p>
                <div className={styles.right}>
                  <span className={styles.setting} style={{display: userInfo.tradePassword ? 'none' : 'block'}} onClick={() => this.setting('fund')}>{formatMessage({id: 'mine.setting'})}</span>
                  <span className={styles.modify} style={{display: userInfo.tradePassword ? 'inline' : 'none'}} onClick={() => this.modify('fund')}>{formatMessage({id: 'mine.modify'})}</span>
                  {/* <span className={styles.forget} style={{display: userInfo.tradePassword ? 'inline' : 'none'}} onClick={() => this.forgetFund()}>{formatMessage({id: 'mine.forget'})}?</span> */}
                </div>
              </div>
            </li>
            <li>
              <img src={SafeIcon2} alt=""/>
              <div className={styles.listDiv}>
                <p className={styles.left}>{formatMessage({id: 'mine.login.password'})}</p>
                <div className={styles.right}>
                  <span className={styles.modify} onClick={() => this.modify('login')}>{formatMessage({id: 'mine.modify'})}</span>
                  {/* <span className={styles.forget} onClick={() => this.forgetLogin()}>{formatMessage({id: 'mine.forget'})}?</span> */}
                </div>
              </div>
            </li>
            <li>
              <img src={SafeIcon3} alt=""/>
              <div className={styles.listDiv}>
                <p className={styles.left}>
                  {formatMessage({id: 'mine.phone.verification'})}
                  <span>{formatMessage({id: 'notice.phone.validation'})}</span>
                </p>
                <div className={styles.right}>
                  <span className={styles.phone} style={{display: userInfo.mobile ? 'block' : 'none'}}>{mobile}</span>
                  <Switch checked={parseInt(mobileAuth) === 1} style={{display: userInfo.mobile ? 'block' : 'none'}} onChange={this.switch.bind(this, 1)}></Switch>
                  <span className={styles.mail} style={{display: userInfo.mobile ? 'none' : 'block', color: '#007AFF'}} onClick={() => this.showBind(1)}>{formatMessage({id: 'bind'})}</span>
                </div>
              </div>
            </li>
            <li>
              <img src={SafeIcon4} alt=""/>
              <div className={styles.listDiv}>
                <p className={styles.left}>
                  {formatMessage({id: 'mine.email.verification'})}
                  <span>{formatMessage({id: 'notice.email.validation'})}</span>
                </p>
                <div className={styles.right}>
                  <span className={styles.phone} style={{display: userInfo.email ? 'block' : 'none'}}>{userInfo.email}</span>
                  <Switch checked={parseInt(emailAuth) === 1} style={{display: userInfo.email ? 'block' : 'none'}} onChange={this.switch.bind(this, 0)}></Switch>
                  <span className={styles.mail} style={{display: userInfo.email ? 'none' : 'block', color: '#007AFF'}} onClick={() => this.showBind(0)}>{formatMessage({id: 'bind'})}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

Safe.defaultProps = {
}

export default connect(({ user, global }) => ({
  user, global
}))(Safe);
