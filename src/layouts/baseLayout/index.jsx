import { Component } from "react";
import styles from './index.less';
import LogoIcon from '@/assets/image/logo.png';
import BottomIcon from '@/assets/image/bottom.png';
import TopIcon from '@/assets/image/top.png';
import LangIcon from '@/assets/image/lang.png';
import LangIcon2 from '@/assets/image/lang2.png';
import AssetsIcon01 from '@/assets/image/assets01.png';
import AssetsIcon02 from '@/assets/image/assets02.png';
import AssetsIcon04 from '@/assets/image/assets04.png';
import AssetsIcon05 from '@/assets/image/assets05.png';
import DefaultIcon from '@/assets/image/default.png';
import MessageIcon from '@/assets/image/message.png';
import { formatMessage, setLocale, getLocale } from 'umi/locale';
import { Menu, Dropdown } from 'antd';
import { connect } from 'dva';
import { getCookie, removeCookie, decryptByDES } from '@/utils/utils';
import downloadCode from '@/assets/image/downloadCode.png';

import Link from 'umi/link';
import router from "umi/router";
let timer = null;

class BaseLayout extends Component {
  state = {
    langText: '简体中文',
    showAssetsList: false
  };
  componentDidMount () {
    const locale = getLocale();
    const langText = locale === 'en-US' ? 'English' : '简体中文';
    this.getUnreadCount()
    this.setState({
      langText
    });
  }
  showAssetsList () {
    clearTimeout(timer);
    this.setState({
      showAssetsList: true
    });
  };
  logout () {
    localStorage.clear();
    removeCookie('userInfo');
    removeCookie('token');
    router.replace('/')
  };
  hideAssetsList () {
    timer = setTimeout(() => {
      this.setState({
        showAssetsList: false
      });
    }, 200)
  };
  getUnreadCount() {
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId !== '') {
      dispatch({
        type: 'global/getUnreadCount',
        payload: `${userId}`
      })
    }
  }
  componentWillUnmount () {
    clearTimeout(timer)
  }
  handleMenuClick = e => {
    if (e.key === 'item_0') {
      setLocale('zh-CN');
    } else {
      setLocale('en-US');
    }
  }
  render () {
    const { pathname, global: { unReadCount } } = this.props;
    const userInfo = getCookie('userInfo') ? JSON.parse(getCookie('userInfo')) : {};
    const userId = decryptByDES(getCookie('token')) || '';
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this)}>
        <Menu.Item>简体中文</Menu.Item>
        <Menu.Item>English</Menu.Item>
      </Menu>
    );
    let showTop = true;
    if (pathname === '/' || pathname === '/index' || pathname === '/mine' || pathname === '/login' || pathname === '/register' || pathname === '/forget') {
      showTop = false
    } else {
      showTop = true
    }
    const { langText, showAssetsList } = this.state;
    return (
      <header className={styles.header} style={{backgroundColor: showTop ? '#060C30' : 'transparent'}}>
        <div className={styles.headerInner}>
          <div className={styles.left}>
            <Link to="/">
              <img src={LogoIcon} alt="logo" className={styles.logo} />
            </Link>
            <ul className={styles.nav}>
              <li className={styles.nav_item}>
                <Link to="/" replace className={pathname === '/' || pathname === '/index' ? styles.active : ''}>
                  <span className={styles.text}>{formatMessage({id: 'navBar.index'})}</span>
                  <span className={styles.line}></span>
                </Link>
              </li>
              <li className={styles.nav_item}>
                <Link to="/trading/0" replace className={`${styles.tradings} ${pathname.indexOf('/trading') > -1 ? styles.active : ''}`}>
                  <p className="ant-dropdown-link" style={{ paddingTop: '18px', color: '#AEB9D8', paddingBottom: '14px'}}>
                    <span className={styles.text}>{formatMessage({id: 'website'})}</span>
                  </p>
                  <span className={styles.line}></span>
                </Link>
              </li>
              <li className={styles.nav_item}>
                <Link to="/guess" replace className={pathname === '/guess' ? styles.active : ''}>
                  <span className={styles.text}>{formatMessage({id: 'guess.title'})}</span>
                  <span className={styles.line}></span>
                </Link>
              </li>
              <li className={styles.nav_item}>
                <Link to="/follow" replace className={pathname === '/follow' ? styles.active : ''}>
                  <span className={styles.text}>{formatMessage({id: 'community.title'})}</span>
                  <span className={styles.line}></span>
                </Link>
              </li>
              <li className={styles.nav_item}>
                <Link to="/finance" replace className={pathname === '/finance' ? styles.active : ''}>
                  <span className={styles.text}>{formatMessage({id: 'navBar.record'})}</span>
                  <span className={styles.line}></span>
                </Link>
              </li>
            </ul>
          </div>
          <div className={styles.right}>
            <ul className={styles.nav}>
              <li className={styles.nav_item}>
                <Link to="/fund" replace className={pathname.indexOf('/fund') > -1 ? styles.active : ''}>
                  <span className={styles.text}>{formatMessage({id: 'navBar.assets'})}</span>
                  <span className={styles.line}></span>  
                </Link>
              </li>
              <li className={styles.nav_item} style={{display: userId !== '' ? 'block' : 'none'}} onMouseOver={this.showAssetsList.bind(this)} onMouseOut={this.hideAssetsList.bind(this)}>
                <img src={userInfo.icon || DefaultIcon} className={styles.default} alt=""/>
                <img src={showAssetsList ? TopIcon : BottomIcon} alt="" className={styles.bottom} />
                <div className={styles.asstesList} style={{display: showAssetsList ? 'block': 'none'}} onMouseOver={this.showAssetsList.bind(this)}>
                  <div className={styles.assetsPhone}>{userInfo.mobile || userInfo.email}</div>
                  <Link to="/mine" replace className={styles.assetsUser}><img src={AssetsIcon01} alt=""/>{formatMessage({id: 'navBar.mine.personal.center'})}</Link>
                  <Link to="/share" replace className={styles.assetsUser}><img src={AssetsIcon02} alt=""/>{formatMessage({id: 'navBar.mine.invite'})}</Link>
                  <a href="https://test.starqueen.top" className={styles.assetsUser}><img src={AssetsIcon04} alt="" />{formatMessage({id: 'experience'})}</a>
                  <div className={styles.assetsLayout} onClick={this.logout.bind(this)}><img src={AssetsIcon05} alt="" />{formatMessage({id: 'navBar.mine.logout'})}</div>
                </div>
              </li>
              <li className={`${styles.nav_item} ${styles.login}`} style={{display: userId !== '' ? 'none' : 'block'}}><Link to="/user/login" replace>{formatMessage({id: 'login'})}</Link></li>
              <li className={`${styles.nav_item} ${styles.register}`} style={{display: userId !== '' ? 'none' : 'block'}}><Link to="/user/register" replace>{formatMessage({id: 'register'})}</Link></li>
              <li style={{display: userId !== '' ? 'block' : 'none'}} className={`${styles.nav_item} ${styles.message}`}>
                <Link to="/message" replace><img src={MessageIcon} alt=""/><span style={{display: unReadCount !== 0 ? 'block' : 'none'}} /></Link>
              </li>
              <li className={`${styles.nav_item} ${styles.download}`}>
                <div className={styles.icon}>{formatMessage({id: 'navBar.download'})}</div>
                <img src={downloadCode} className={styles.code} alt=""/>
              </li>
              <li className={`${styles.nav_item} ${styles.lang}`}>
                <img src={langText === '简体中文' ? LangIcon : LangIcon2} alt="" className={styles.langIcon} />
                <Dropdown overlay={menu} className={styles.dropdown}>
                  <p className="ant-dropdown-link">
                    <span>{langText}</span>
                    <img src={BottomIcon} alt="" className={styles.bottom} />
                  </p>
                </Dropdown>
              </li>
            </ul>
          </div>
        </div>
      </header>
    )
  }
}
BaseLayout.defaultProps = {
  pathname: ''
}

export default connect(({ global }) => ({
  global,
}))(BaseLayout);