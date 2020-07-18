import styles from './index.less';
import React, { Component } from 'react';
import leftFundIcon01 from '@/assets/image/fund/fund_left01.png';
import leftFundIcon02 from '@/assets/image/fund/fund_left02.png';
import leftFundIcon03 from '@/assets/image/fund/fund_left03.png';
import { formatMessage } from 'umi/locale';
import { Spin } from 'antd';
import { connect } from 'dva';
import { getCookie, decryptByDES } from '@/utils/utils';
import router from 'umi/router';

class leftFund extends Component {
  state = {
    leftFundItem: [{
      icon: leftFundIcon01,
      text: `${formatMessage({id: 'fund.contract'})}`,
      url: '/fund'
    }, {
      icon: leftFundIcon02,
      text: `${formatMessage({id: 'fund.assets'})}`,
      url: '/fund/asset',
    }, {
      icon: leftFundIcon03,
      text: `${formatMessage({id: 'fund.option'})}`,
      url: '/fund/option',
    }],
    curIndex: 0,
    pathname: '/fund',
  }
  componentDidMount() {
    const { dispatch, location } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    const coinType = 1;
    const { pathname } = location;
    if (userId !== '') {
      dispatch({
        type: 'fund/getAccount',
        payload: { userId, coinType }
      })
    }
    this.setState({
      pathname
    })
  }
  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        pathname: this.props.location.pathname,
      })
    }
  }
  changeMenu (url) {
    this.setState({
      pathname: url,
    })
    router.push({
      pathname: url,
    });
  };
  render () {
    let { leftFundItem } = this.state;
    const { global: { fundActiveIdx } } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const userId = decryptByDES(getCookie('token')) || '';
    if ((coinContracts.length < 1 || accountDetails.length < 1) && userId !== '') {
      return <div style={{width: '100%', minHeight: 'inherit', backgroundColor: '#060C30', opacity: '0.98', textAlign: 'center', paddingTop: '300px'}}><Spin spinning={true} delay={500}></Spin></div>
    }
    const props = this.props;
    const leftFund = leftFundItem.map((item, index) => {
      return <li className={styles.item} key={index}>
        <div className={`${styles.top} ${fundActiveIdx === index ? styles.active : ''}`} onClick={this.changeMenu.bind(this, item.url)}>
          <img src={item.icon} alt="" />
          <p className={styles.title}>{item.text}</p>
        </div>
      </li>
    })
    return (
      <div className={styles.fundWrap}>
        <div className={styles.fundWrapInner}>
          <ul className={styles.left}>
            {leftFund}
          </ul>
          <div className={styles.right}>
            {props.children}
          </div>
        </div>
      </div>
    )
  }
}

leftFund.defaultProps = {
  
};
export default connect(({ fund, global }) => ({
  fund, global
}))(leftFund);