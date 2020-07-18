import React, { Component } from "react";
import styles from './index.less';
import { Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { connect } from 'dva';

class Assets extends Component {
  state = { };
  toTransfer() {
    const { trading: { curTypeIdx }, contractList, dispatch } = this.props;
    const transferInfo = {
      transfer: 0,
      coinType: contractList[curTypeIdx].coinId,
      contId: contractList[curTypeIdx].contId
    }
    sessionStorage.setItem('transferInfo', JSON.stringify(transferInfo));
    router.push({
      pathname: '/fund/transfer',
    })
    dispatch({
      type: 'global/changeFundActiveIdx',
      payload: 0
    })
  }
  render () {
    const { trading: { myAsset, curTypeIdx }, contractList } = this.props;
    const unit = contractList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : contractList[curTypeIdx].contName.indexOf('(') > -1 ? contractList[curTypeIdx].contName.match(/\((\S*)\)/)[1] : contractList[curTypeIdx].contName.split('/')[0]
    // 账户权益、未实现盈亏、可用、已用、冻结、保证金率
    const list = [{
      top: `${myAsset.balance}`,
      bottom: `${formatMessage({id: 'trading.center.account.rights'})}`,
      title: `${formatMessage({id: 'trading.center.account.rights.title'})}`,
      underline: true
    },
    {
      top: `${myAsset.settle}`,
      bottom: `${formatMessage({id: 'trading.center.realized'})}`,
      title: `${formatMessage({id: 'trading.center.realized.title'})}`,
      underline: true
    },
    {
      top: `${myAsset.profit}`,
      bottom: `${formatMessage({id: 'trading.center.unrealized'})}`,
      title: `${formatMessage({id: 'trading.center.unrealized.title'})}`,
      underline: true
    }, {
      top: `${myAsset.usable}`,
      bottom: `${formatMessage({id: 'trading.center.available'})}`,
      title: '',
      underline: false
    }, {
      top: `${myAsset.used}`,
      bottom: `${formatMessage({id: 'trading.center.used'})}`,
      title: '',
      underline: false
    }, {
      top: `${myAsset.freeze}`,
      bottom: `${formatMessage({id: 'trading.center.freeze'})}`,
      title: `${formatMessage({id: 'trading.center.freeze.title'})}`,
      underline: true
    }]
    return (
      <div className={styles.assets}>
        <div className={styles.first}>
          <p>{formatMessage({id: 'trading.center.assets'})}</p>
          <div className={styles.last} onClick={this.toTransfer.bind(this)}>
            {formatMessage({id: 'transfer'})}
          </div>
        </div>
        <div className={styles.lists}>
          {list.map((item, index) => {
            return <div key={index} className={styles.item}>
              <Tooltip title={item.title}>
                <span style={{textDecoration: item.underline ? 'underline' : 'none'}}>{item.bottom}</span>
              </Tooltip>
              <p>{item.top} {unit}</p>
            </div>
          })}
          <div className={styles.item}>
            <Tooltip title={formatMessage({id: 'trading.center.margin.rate'})}>
              <span style={{textDecoration: 'underline'}}>{formatMessage({id: 'trading.center.margin.rate'})}</span>
            </Tooltip>
            <p>{myAsset.bondRate}</p>
          </div>
        </div>
      </div>
    )
  }
}

Assets.defaultProps = {
}
export default connect(({ trading }) => ({
  trading,
}))(Assets);