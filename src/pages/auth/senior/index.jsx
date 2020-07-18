import React, { Component } from "react";
import styles from './index.less';
import PrimaryIcon from '@/assets/image/auth/primary02.png';
import SeniorIcon from '@/assets/image/auth/senior02.png';
import YesIcon from '@/assets/image/auth/yes.png';
import NoticeIcon from '@/assets/image/auth/notice.png';
import { showErrorMessage, setCookie, getCookie, decryptByDES, removeCookie } from '@/utils/utils';
import CardIcon1 from '@/assets/image/mine/card1.jpg';
import CardIcon2 from '@/assets/image/mine/card2.jpg';
import CardIcon3 from '@/assets/image/mine/card3.png';
import CardIcon4 from '@/assets/image/mine/card4.jpg';
import CardIcon5 from '@/assets/image/mine/card5.jpg';
import CardIcon6 from '@/assets/image/mine/card6.jpg';
import { formatMessage, getLocale } from 'umi/locale';
import router from "umi/router";
import { connect } from 'dva';
let timer = null;
class Auth extends Component {
  state = {
    front: '',
    back: '',
    face: '',
    disabled: false,
    defaultFront: CardIcon1,
    defaultBack: CardIcon2,
    defaultHand: CardIcon3
  };
  addFront (type, event) {
    event.preventDefault();
    let formData = new FormData()
    const inputDOM = event.target.files[0];
    formData.append('file', inputDOM)
    formData.append('folderId', inputDOM.name)
    formData.append('softType', inputDOM.type)
    const picSize = inputDOM.size / 1024 / 1024;
    if ( picSize > 4) {
      showErrorMessage(`${formatMessage({id: 'notice.pic.size'})}`);
      return false;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'global/uploadImage',
      payload: formData,
      callback: (obj) => {
        if(type === 'front') {
          this.setState({
            front: obj.path,
          })
        } 
        if (type === 'back') {
          this.setState({
            back: obj.path
          })
        }
        if (type === 'face') {
          this.setState({
            face: obj.path
          })
        }
      }
    })
  };
  componentDidMount() {
    const locale = getLocale();
    if (locale === 'zh-CN') {
      // 中文
      this.setState({
        defaultFront: CardIcon1,
        defaultBack: CardIcon2,
        defaultHand: CardIcon3
      })
    } else if (locale === 'en-US'){
      this.setState({
        defaultFront: CardIcon4,
        defaultBack: CardIcon5,
        defaultHand: CardIcon6
      })
    }
  };
  verify () {
    const { front, back, face } = this.state;
    if (front.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.idNumber.front'})}`);
      return false;
    }
    if (back.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.idNumber.back'})}`);
      return false;
    }
    if (face.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.idNumber.face'})}`);
      return false;
    }
  };
  confirm() {
    if (this.verify() === false) return;
    const { realName, idNumber, dispatch } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    const { front, back, face } = this.state;
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }
    this.setState({
      disabled: true
    })
    timer = setTimeout(() => {
      this.setState({
        disabled: false
      })
    }, 3000)
    dispatch({
      type: 'auth/auth',
      payload: { realName, idNumber, front, back, face, userId },
      callback: () => {
        let userInfo = JSON.parse(getCookie('userInfo'));
        userInfo.realName = realName;
        userInfo.idNumber = idNumber;
        userInfo.front = front;
        userInfo.back = back;
        userInfo.face = face;
        setCookie('userInfo', JSON.stringify(userInfo));
      }
    })
  }
  componentWillMount () {
    clearTimeout(timer)
  }
  render () {
    const { front, back, face, disabled, defaultFront, defaultBack, defaultHand } = this.state;
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
            <div />
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
          <ul className={styles.form2}>
            <li>
              <span>{formatMessage({id: 'mine.id.number.front.photo'})}</span>
              <div className={styles.cardWrap}>
                <div className={styles.cardInner}>
                  <img src={front || defaultFront} alt=""/>
                  <input type="file" id="front" onChange={this.addFront.bind(this, 'front')} multiple={false} accept="image/jpg,image/jpeg,image/png,image/bmp" />
                  <label htmlFor="front">{formatMessage({id: 'mine.upload'})}</label>
                </div>
                <p className={styles.notice}>{formatMessage({id: 'mine.upload.notice'})}</p>
              </div>
            </li>
            <li>
              <span>{formatMessage({id: 'mine.id.number.back.photo'})}</span>
              <div className={styles.cardWrap}>
                <div className={styles.cardInner}>
                  <img src={back || defaultBack} alt=""/>
                  <input type="file" id="back" onChange={this.addFront.bind(this, 'back')} multiple={false} accept="image/jpg,image/jpeg,image/png,image/bmp" />
                  <label htmlFor="back">{formatMessage({id: 'mine.upload'})}</label>
                </div>
                <p className={styles.notice}>{formatMessage({id: 'mine.upload.notice'})}</p>
              </div>
            </li>
            <li>
              <span>{formatMessage({id: 'mine.hold.id.number.photo'})}</span>
              <div className={styles.cardWrap}>
                <div className={styles.cardInner}>
                  <img src={face || defaultHand} alt=""/>
                  <input type="file" id="face" onChange={this.addFront.bind(this, 'face')} multiple={false} accept="image/jpg,image/jpeg,image/png,image/bmp" />
                  <label htmlFor="face">{formatMessage({id: 'mine.upload'})}</label>
                </div>
                <p className={styles.notice}>{formatMessage({id: 'mine.upload.notice'})}</p>
              </div>
            </li>
          </ul>
          <button className={styles.btn} onClick={() => this.confirm()} disabled={disabled}>{formatMessage({id: 'confirm'})}</button>
        </div>
      </div>
    )
  }
}

Auth.defaultProps = {
  realName: '',
  idNumber: ''
}
export default connect(({ global, auth }) => ({
  global, auth
}))(Auth);