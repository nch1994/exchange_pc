import React, { Component } from "react";
import styles from './index.less';
import EyeOpenIcon from '@/assets/image/fund/eye_open.png';
import EyeCloseIcon from '@/assets/image/fund/eye_close.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Table } from 'antd';
import router from 'umi/router';
import { decryptByDES, getCookie, filterPoint, filterOptionDigit } from '@/utils/utils'

class Option extends Component {
  state = {
    isShow: true,
    guessBTC: 0,
    guessCNY: 0,
    tradeRecords: []
  };
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fund/getOptionAccount',
      payload: `${decryptByDES(getCookie('token'))}`,
      callback: (obj) => {
        obj.guessAccounts.forEach((element, index) => {
          element.freeze = filterPoint(element.freeze || 0, filterOptionDigit(element.contName));
          element.balance = filterPoint(element.balance || 0, filterOptionDigit(element.contName));
          element.settle = filterPoint(element.settle || 0, filterOptionDigit(element.contName));
          element.contName = element.contName.split('(')[0];
          element.transferInfo = {
            contName: 'BTC',
            coinType: element.coinId,
            contId: element.contId,
          }
        })
        this.setState({
          guessBTC: obj.guessBTC,
          guessCNY: obj.guessCNY,
          tradeRecords: obj.guessAccounts
        })
      }
    })
    dispatch({
      type: 'global/changeFundActiveIdx',
      payload: 2
    })
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
  toTrading() {
    router.push('/guess');
  }
  render () {
    const columns = [
      {
        title: `${formatMessage({id: 'guess.table.type'})}`,
        dataIndex: 'contName',
        key: 'contName',
        render: (contName) => {
        return (<span>BTC({contName}){formatMessage({id: 'guess.option'})}</span>)
        }
      },
      {
        title: `${formatMessage({id: 'fund.usable'})}`,
        dataIndex: 'balance',
        key: 'balance',
      },
      {
        title: `${formatMessage({id: 'fund.frozen'})}`,
        dataIndex: 'freeze',
        key: 'freeze',
      },
      {
        title: `${formatMessage({id: 'realized'})}`,
        dataIndex: 'settle',
        key: 'settle',
      },
      {
        title: `${formatMessage({id: 'fund.action'})}`,
        dataIndex: 'transferInfo',
        key: 'transferInfo',
        render: (transferInfo) => {
          return(
            <p>
              <span onClick={() => this.toTrading()} className={styles.links}>{formatMessage({id: 'guess.option'})}{formatMessage({id: 'trading'})}</span>
              <span onClick={() => this.toTransfer(0, transferInfo.coinType, transferInfo.contId)} className={styles.links}>{formatMessage({id: 'transfer'})}</span>
            </p>
          )
        }
      }
    ];
    const { isShow, guessBTC, guessCNY, tradeRecords } = this.state;
    return (
      <div className={styles.chargeWrap}>
        <div className={styles.chargeTop}>
          <div className={styles.info}>
            <p className={styles.title}>{formatMessage({id: 'fund.option'})}</p>
            <p className={styles.usdt}><span>{isShow ? guessBTC || 0 : '****'}</span>BTC</p>
            <p className={styles.cny}><span>≈{isShow ? guessCNY || 0 : '****'}</span>CNY</p>
            {isShow ? <img src={EyeOpenIcon} alt="" onClick={this.eye.bind(this)} /> : <img src={EyeCloseIcon} alt="" onClick={this.eye.bind(this)} />}
          </div>
        </div>
        <div className={styles.chargeBottom}>
          <div className={styles.chargeBottomTitle}>{formatMessage({id: 'fund.contract.option.title'})}</div>
          <Table align="center" rowKey={item => item.contId} columns={columns} dataSource={tradeRecords} className={styles.table} pagination={false} />
        </div>
      </div>
    )
  }
}
Option.defaultProps = {
}
export default connect(({ fund, global }) => ({
  fund, global
}))(Option);