import React, { Component } from "react";
import styles from './index.less';
import PrimaryIcon from '@/assets/image/auth/primary01.png';
import SeniorIcon from '@/assets/image/auth/senior01.png';
import YesIcon from '@/assets/image/auth/yes.png';
import NoticeIcon from '@/assets/image/auth/notice.png';
// import BottomIcon from '@/assets/image/bottom_black.png';
import { formatMessage, getLocale } from 'umi/locale';
import reg from '@/utils/reg';

let user = '';
let card = '';
class Auth extends Component {
  state = {
    BtnActive: false
  };
  user(e) {
    const locale = getLocale();
    user = e.target.value;
    if ((user !== '' && reg.idCard.test(card) && locale === 'zh-CN') || (user !== '' && reg.passport.test(card) && locale === 'en-US')) {
      this.setState({
        BtnActive: true
      })
    } else {
      this.setState({
        BtnActive: false
      })
    }
  };
  card(e) {
    const locale = getLocale();
    card =  e.target.value;
    if ((user !== '' && reg.idCard.test(card) && locale === 'zh-CN') || (user !== '' && reg.passport.test(card) && locale === 'en-US')) {
      this.setState({
        BtnActive: true
      })
    } else {
      this.setState({
        BtnActive: false
      })
    }
  };
  confirm () {
    this.props.onNextBtn(user, card);
  };
  render () {
    const { BtnActive } = this.state;
    return (
      <div className={styles.authWrap}>
        <div className={styles.authTop}>
          <div className={styles.authTopTitle}>
            <div>
              <span className={styles.title}>{formatMessage({id: 'auth.identity.authentication'})}</span>
              <span className={styles.line}></span>
            </div>
          </div>
          <div className={styles.authNotice}>
            <span></span>
            <p>{formatMessage({id: 'auth.notice'})}</p>
          </div>
          <div className={styles.authGrade}>
            <img src={PrimaryIcon} alt=""/>
            <span>Lv.1 {formatMessage({id: 'auth.primary'})}</span>
            <span className={styles.line}></span>
            <img src={SeniorIcon} alt=""/>
            <span>Lv.2 {formatMessage({id: 'auth.senior'})}</span>
          </div>
          <div className={styles.authPower}>
            <div className={styles.authPowerTitle}>
              <img src={NoticeIcon} alt=""/>
              <span>{formatMessage({id: 'auth.auth'})}</span>
            </div>
            <div className={styles.authPowerContent}>
              <img src={YesIcon} alt=""/>
              <span>{formatMessage({id: 'auth.auth.list1'})}</span>
            </div>
            <div className={styles.authPowerContent}>
              <img src={YesIcon} alt=""/>
              <span>{formatMessage({id: 'auth.auth.list2'})}</span>
            </div>
          </div>
          
          <ul className={styles.form}>
            <li>
            <label htmlFor="">{formatMessage({id: 'mine.certificate.type'})}</label>
              <div className={styles.input}>
                <input type="text" value={formatMessage({id: 'idNumber'})} readOnly />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'auth.primary.name'})}</label>
              <div className={styles.input}>
                <input type="text" placeholder={formatMessage({id: 'input.name'})} onChange={(e)=>this.user(e)} />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'auth.primary.id'})}</label>
              <div className={styles.input}>
                <input type="text" placeholder={formatMessage({id: 'input.id.number'})} onChange={(e)=>this.card(e)} />
              </div>
            </li>
          </ul>
          <button className={`${styles.btn} ${BtnActive ? styles.active : ''}`} onClick={() => this.confirm()}>{formatMessage({id: 'auth.primary.next'})}</button>
        </div>
      </div>
    )
  }
}

Auth.defaultProps = {

}
export default Auth;