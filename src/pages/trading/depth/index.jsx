import React, { Component } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
let timer = null;
class Depth extends Component {
  state = {
    curIndex: 0,
    showNumberList: false,
    depthListBids: [],
    depthListAsks: [],
  };
  componentDidMount(){
    const _this = this;
    timer = setInterval(() => {
      const depthListAsks = JSON.parse(sessionStorage.getItem('depthListAsks')) || new Array(9).fill({price: '--', amount: '--'});
      const depthListBids = JSON.parse(sessionStorage.getItem('depthListBids')) || new Array(9).fill({price: '--', amount: '--'});
      _this.setState({
        depthListAsks,
        depthListBids
      })
    }, 500)
  }
  componentWillUnmount() {
    clearInterval(timer);
  }
  setPrice(price) {
    const { dispatch } = this.props;
    dispatch({
      type: 'trading/setLimitPrice',
      payload: price
    })
  }
  showNumberListFn() {
    this.setState({
      showNumberList: true
    })
  };
  hideNumberListFn() {
    this.setState({
      showNumberList: false
    })
  }
  render () {
    const { depthListAsks, depthListBids } = this.state;
    const { trading: { curTypeIdx, contractList } } = this.props;
    return (
      <div className={styles.depth}>
        <div className={styles.title}>{formatMessage({id: 'trading.center.depth'})}</div>
        <div className={styles.items}>
          <div className={`${styles.item} ${styles.subTitle}`}>
            <p>{formatMessage({id: 'price'})}({contractList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : 'USD'})</p>
            <p>{formatMessage({id: 'count'})}</p>
          </div>
          <div className={`${styles.itemH}`}>
            {depthListAsks.map((item, index) => {
              return <div className={styles.item} key={index} onClick={() => this.setPrice(item.price)}>
                <p className={styles.red}>{item.price}</p>
                <p>{item.amount}</p>
                <div className={styles.bgColor} style={{backgroundColor: '#D74E5A15', width: item.percent}} />
              </div>
            })}
          </div>
          <div className={styles.cny} onClick={() => this.setPrice(contractList[curTypeIdx].price)}>
            {contractList[curTypeIdx].price}
          </div>
          <div className={styles.itemH}>
            {depthListBids.map((item, index) => {
              return <div className={styles.item} key={index} onClick={() => this.setPrice(item.price)}>
                <p className={styles.green}>{item.price}</p>
                <p>{item.amount}</p>
                <div className={styles.bgColor} style={{backgroundColor: '#40AD7A15', width: item.percent}} />
              </div>
            })}
          </div>
        </div>
      </div>
    )
  }
}


Depth.defaultProps = {
}
// depthBTCList

export default connect(({ trading, global }) => ({
  trading, global
}))(Depth);
