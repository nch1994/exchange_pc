import React, { Component } from "react";
import styles from './index.less';
import EyeOpenIcon from '@/assets/image/fund/eye_open.png';
import EyeCloseIcon from '@/assets/image/fund/eye_close.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Table } from 'antd';
import router from 'umi/router';
import { getCookie, baseUrl, decryptByDES } from '@/utils/utils';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
let accountSource, accountSourceTimer = null;
class Account extends Component {
  state = {
    isShow: true
  };
  componentDidMount() {
    this.getAccountSource();
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeFundActiveIdx',
      payload: 0
    })
  }
  componentWillUnmount() {
    const userId = decryptByDES(getCookie('token')) || '';
    clearTimeout(accountSourceTimer);
    if (userId !== '' && accountSource) {
      accountSource.close()
    }
  }
  eye () {
    const { isShow } = this.state;
    this.setState({
      isShow: !isShow
    })
  };
  toTransfer(transfer, coinType, contId) {
    const transferInfo = {
      transfer,
      coinType,
      contId
    }
    sessionStorage.setItem('transferInfo', JSON.stringify(transferInfo))
    router.push('/fund/transfer');
  }
  getAccountSource() {
    const { dispatch } = this.props;
    const EventSource = NativeEventSource || EventSourcePolyfill;
    const userId = decryptByDES(getCookie('token')) || '';
    const _this = this;
    accountSource = new EventSource(`${baseUrl}sse/getAccount?userId=${userId}&coinType=1`);
    accountSource.onmessage = function (event) {
      const obj = JSON.parse(event.data)
      dispatch({
        type: 'fund/getSSEAccount',
        payload: obj
      })
    };
    accountSource.onerror = function (event) {
      accountSource.close()
      accountSourceTimer = setTimeout(() => {
        _this.getAccountSource()
        clearTimeout(accountSourceTimer);
      }, 3000)
    }
  }
  toTrading(coinType, contId) {
    sessionStorage.setItem('tradingContId', contId)
    if (parseInt(coinType) === 1) {
      router.push('/trading/0');
    } else {
      if (parseInt(contId) < 41) {
        router.push('/trading/1');
      } else {
        router.push('/trading/2');
      }
    }
  }
  render () {
    const columns = [
      {
        title: `${formatMessage({id: 'fund.contractType'})}`,
        dataIndex: 'contName',
        key: 'contName',
      },
      {
        title: `${formatMessage({id: 'accountRights'})}`,
        dataIndex: 'balance',
        key: 'balance',
      },
      {
        title: `${formatMessage({id: 'unrealized'})}`,
        dataIndex: 'profit',
        key: 'profit',
      },
      {
        title: `${formatMessage({id: 'marginRate'})}`,
        dataIndex: 'bondRate',
        key: 'bondRate',
      },
      {
        title: `${formatMessage({id: 'fund.action'})}`,
        dataIndex: 'transferInfo',
        key: 'transferInfo',
        render: (transferInfo) => {
          return(
            <p>
              <span onClick={() => this.toTrading(transferInfo.coinType, transferInfo.contId)} className={styles.links}>{formatMessage({id: 'trading'})}</span>
              <span onClick={() => this.toTransfer(0, transferInfo.coinType, transferInfo.contId)} className={styles.links}>{formatMessage({id: 'transfer'})}</span>
            </p>
          )
        }
      }
    ];
    const { isShow } = this.state;
    const { fund: { contractBTC, contractCNY, contractAccounts } } = this.props;
    return (
      <div className={styles.chargeWrap}>
        <div className={styles.chargeTop}>
          <div className={styles.info}>
            <p className={styles.title}>{formatMessage({id: 'fund.contract.value'})}</p>
            <p className={styles.usdt}><span>{isShow ? contractBTC || 0 : '****'}</span>BTC</p>
            <p className={styles.cny}><span>≈{isShow ? contractCNY || 0 : '****'}</span>CNY</p>
            {isShow ? <img src={EyeOpenIcon} alt="" onClick={this.eye.bind(this)} /> : <img src={EyeCloseIcon} alt="" onClick={this.eye.bind(this)} />}
          </div>
        </div>
        <div className={styles.chargeBottom}>
          <div className={styles.chargeBottomTitle}>{formatMessage({id: 'fund.contract.title'})}</div>
          <Table align="center" rowKey={item => item.contId} columns={columns} dataSource={contractAccounts} className={styles.table} pagination={false} />
        </div>
      </div>
    )
  }
}
Account.defaultProps = {
}
export default connect(({ fund, global }) => ({
  fund, global
}))(Account);