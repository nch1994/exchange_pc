import React, { Component } from "react";
import styles from './index.less';
import EyeOpenIcon from '@/assets/image/fund/eye_open.png';
import EyeCloseIcon from '@/assets/image/fund/eye_close.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Table } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';

class Asset extends Component {
  state = {
    isShow: true,
  };
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeFundActiveIdx',
      payload: 1
    })
  }
  eye () {
    const { isShow } = this.state;
    this.setState({
      isShow: !isShow
    })
  };
  toTransfer(transfer, coinType) {
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts'));
    let index = coinContracts.findIndex((element) => {
      return parseInt(element.coinType) === parseInt(coinType);
    })
    index = index < 0 ? 0 : index;
    const transferInfo = {
      transfer,
      coinType,
      contId: coinContracts[index].contractAccountList[0].contId
    }
    sessionStorage.setItem('transferInfo', JSON.stringify(transferInfo))
    router.push('/fund/transfer');
  }

  render () {
    const columns = [
      {
        title: `${formatMessage({id: 'fund.coinType'})}`,
        dataIndex: 'enName',
        key: 'enName',
      },
      {
        title: `${formatMessage({id: 'fund.chainName'})}`,
        dataIndex: 'chainName',
        key: 'chainName',
      },
      {
        title: `${formatMessage({id: 'fund.usable'})}`,
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: `${formatMessage({id: 'fund.frozen'})}`,
        dataIndex: 'freezeAmount',
        key: 'freezeAmount',
      },
      {
        title: `${formatMessage({id: 'fund.assets.conversion'})}(CNY)`,
        dataIndex: 'cny',
        key: 'cny',
      },
      {
        title: `${formatMessage({id: 'action'})}`,
        dataIndex: 'transferInfo',
        key: 'transferInfo',
        render: (transferInfo) =>{
          return(
            <p>
              <Link to={`/fund/charge/${transferInfo.contName}`} className={styles.links}>{formatMessage({id: 'charge'})}</Link>
              <Link to={`/fund/withdraw/${transferInfo.contName}`} className={styles.links}>{formatMessage({id: 'withdraw'})}</Link>
              <span onClick={() => this.toTransfer(1, transferInfo.coinType)} className={styles.links}>{formatMessage({id: 'transfer'})}</span>
            </p>
          )
        }
      }
    ];
    const { isShow } = this.state;
    const { fund: { totalBTC, totalCNY} } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || []
    return (
      <div className={styles.chargeWrap}>
        <div className={styles.chargeTop}>
          <div className={styles.info}>
            <p className={styles.title}>{formatMessage({id: 'fund.assets.value'})}</p>
            <p className={styles.usdt}><span>{isShow ? totalBTC || 0 : '****'}</span>BTC</p>
            <p className={styles.cny}><span>≈{isShow ? totalCNY || 0 : '****'}</span>CNY</p>
            {isShow ? <img src={EyeOpenIcon} alt="" onClick={this.eye.bind(this)} /> : <img src={EyeCloseIcon} alt="" onClick={this.eye.bind(this)} />}
          </div>
        </div>
        <div className={styles.chargeBottom}>
          <div className={styles.chargeBottomTitle}>{formatMessage({id: 'fund.assets.title'})}</div>
          <Table align="center" rowKey={item =>item.coinType} columns={columns} dataSource={accountDetails} pagination={false} className={styles.table} />
        </div>
      </div>
    )
  }
}

export default connect(({ fund, global }) => ({
  fund, global
}))(Asset);