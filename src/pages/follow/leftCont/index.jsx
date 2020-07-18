import React, { Component } from 'react';
import styles from './index.less';
import { Empty } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import NodataIcon from '@/assets/image/nodata.png';
import { Scrollbars } from 'react-custom-scrollbars';

class LeftCont extends Component {
  changeContractIdx(index) {
    this.props.onContractIdx(index)
  }
  render () {
    const { global: { contractList }, contractIdx } = this.props;
    const scrollLeft = window.innerHeight - 100 - 32;
    const contractList1 = contractList.filter((element, index) => {
      return element.coinId === 1 // 保证金
    })
    const contractList2 = contractList.filter((element, index) => {
      return element.coinId > 1
    })
    const ContractItem1 = contractList1.map((item, index) => {
      return <li key={index} className={`${styles.contractItem} ${contractIdx === index ? styles.active : ''}`} onClick={() => this.changeContractIdx(index)}>
        <p>{item.contName}{formatMessage({id: 'perpetual'})}</p>
        <ul>
          <li><p style={{color: item.rate.indexOf('-') > -1 ? '#D74E5A' : '#41B37D'}}>{item.price}</p><p>{formatMessage({id: 'trading.type.newPrice'})}</p></li>
          <li><p style={{color: item.rate.indexOf('-') > -1 ? '#D74E5A' : '#41B37D'}}>{item.rate}</p><p>{formatMessage({id: 'trading.type.gains'})}</p></li>
        </ul>
      </li>
    })
    const ContractItem2 = contractList2.map((item, index) => {
      return <li key={index} className={`${styles.contractItem} ${contractIdx === index+contractList1.length ? styles.active : ''}`} onClick={() => this.changeContractIdx(index+contractList1.length)}>
        <p>{item.contName}{formatMessage({id: 'perpetual'})}</p>
        <ul>
          <li><p style={{color: item.rate.indexOf('-') > -1 ? '#D74E5A' : '#41B37D'}}>{item.price}</p><p>{formatMessage({id: 'trading.type.newPrice'})}</p></li>
          <li><p style={{color: item.rate.indexOf('-') > -1 ? '#D74E5A' : '#41B37D'}}>{item.rate}</p><p>{formatMessage({id: 'trading.type.gains'})}</p></li>
        </ul>
      </li>
    })
    return (
      <div className={styles.wrap}>
        <Scrollbars style={{height: scrollLeft}}>
          <div style={{display: contractList1.length > 0 || contractList2.length > 0 ? 'block' : 'none'}}>
            <p className={styles.swapTitle}>{formatMessage({id: 'usdtSwap'})}</p>
            <ul className={styles.leftItem}>
              {ContractItem1}
            </ul>
            <p className={styles.swapTitle}>{formatMessage({id: 'coinSwap'})}</p>
            <ul className={styles.leftItem}>
              {ContractItem2}
            </ul>
          </div>
          <div style={{display: contractList1.length === 0 || contractList2.length === 0 ? 'block' : 'none'}}>
            <Empty image={NodataIcon} description={formatMessage({id: 'noData'})} />
          </div>
        </Scrollbars>
      </div>
    )
  }
}

export default connect(({ follow, global }) => ({
  follow, global
}))(LeftCont);