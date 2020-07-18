import React, { Component } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import numeral from 'numeral';
import Link from 'umi/link';
class Type extends Component {
  changeTypeIdx (index, contId, okex) {
    if (this.props.trading.contId !== contId) {
      sessionStorage.removeItem('depthListAsks')
      sessionStorage.removeItem('depthListBids')
      sessionStorage.removeItem('depthPrice')
      sessionStorage.removeItem('depthAsks400')
      sessionStorage.removeItem('depthBids400')
    }
    const { dispatch, trading } = this.props;
    dispatch({
      type: "trading/changeIndex",
      payload: {
        ...trading,
        curTypeIdx: index,
        contId: contId
      },
    });
    dispatch({
      type: 'trading/setEntrustNow',
      payload: []
    })
    sessionStorage.setItem('tradingContId', contId);
  }
  changeContTypeIndex(index) {
    const { dispatch } = this.props;
    dispatch({
      type: 'trading/changeContTypeIndex',
      payload: index
    })
  }
  render () {
    const { trading: { curTypeIdx, contractList, contTypeIdx }, list } = this.props;
    return (
      <div className={styles.typeWrapper}>
        <ul className={styles.contTypeWrap}>
          {
            list.map((element, index) => {
              return <li key={index}>
                <Link className={`${contTypeIdx === index ? styles.active : ''}`} to={`/trading/${index}`}><span className={styles.text}>{element}</span><span className={styles.line} /></Link>
              </li>
            })
          }
        </ul>
        <div className={styles.depthInner}>
          {
            contractList.length < 1
            ? <div className={styles.empty}>{formatMessage({id: 'noData'})}</div>
            : <ul className={styles.centerLeft}>
                <li>
                  <p>{formatMessage({id: 'trading.bottom.contract'})}</p>
                  <p>{formatMessage({id: 'trading.type.newPrice'})}</p>
                  <p>{formatMessage({id: 'trading.type.gains'})}</p>
                </li>
              {contractList.map((item, index) => {
                return <li key={index} className={curTypeIdx === index ? styles.active: ''} onClick={this.changeTypeIdx.bind(this, index, item.contId, item.okex)}>
                  <p>{(item.contName).split('/')[0]}</p>
                  <p style={{color: numeral(item.rate)._value >= 0 ? '#40AD7A' :  '#FA6A46'}}>{item.price}</p>
                  <p style={{color: numeral(item.rate)._value >= 0 ? '#40AD7A' :  '#FA6A46'}}>{item.rate}</p>
                </li>
              })}
            </ul>
          }
        </div>
      </div>
    )
  }
}
export default connect(({ trading, global }) => ({
  trading, global
}))(Type);