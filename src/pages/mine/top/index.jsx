import React, { Component } from "react";
import styles from './index.less';
import { connect } from 'dva';
import { getCookie } from '@/utils/utils';
import DefaultIcon from '@/assets/image/default.png';


class Top extends Component {
  state = {
    clientWidth: 1920
  };
  componentDidMount() {
    this.setState({
      clientWidth: document.body.clientWidth
    });
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  handleResize = e => {
    this.setState({
      clientWidth: e.target.innerWidth
    })
  }
  render () {
    const { clientWidth } = this.state;
    const userInfo = JSON.parse(getCookie('userInfo'))
    let mobile = '';
    if (userInfo.mobile) {
      mobile = userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return (
      <div className={styles.top} style={{width: clientWidth < 1200 ? 1200 : clientWidth}}>
        <div className={styles.bgTop} />
        <div className={styles.topInfo}>
          <div className={styles.topLeft}>
            <img src={userInfo.icon || DefaultIcon} alt=""/>
          </div>
          <div className={styles.topRight}>
            <p className={styles.name}>HI,{userInfo.nickName || 'STARQUEEN'}<span style={{display: userInfo.email ? 'inline' : 'none'}}>{userInfo.email}</span></p>
            <p className={styles.phone} style={{display: userInfo.mobile ? 'block' : 'none'}}>{mobile}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(({ user, global }) => ({
  user, global
}))(Top);