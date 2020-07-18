import React, { Component } from 'react';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';

class Bottom extends Component{
  
  changeEntrustIdx(index) {
    const { dispatch, trading } = this.props;
    dispatch({
      type: "trading/changeIndex",
      payload: {
        ...trading,
        entrustIdx: index
      },
    });
  };
  render () {
    const { entrustIdx } = this.props.trading;
    const entrustList = [`${formatMessage({id: 'trading.bottom.current.position'})}`, `${formatMessage({id: 'trading.bottom.current'})}`, `${formatMessage({id: 'trading.bottom.history'})}`, `${formatMessage({id: 'trading.stop.entrust'})}`];
    return (
      <div style={styles.bottom}>
        <div className={styles.bottomTitle}>
          <ul className={styles.recordTitle}>
            {entrustList.map((item, index) => {
              return <li key={index} className={entrustIdx === index ? styles.active : ''} onClick={this.changeEntrustIdx.bind(this, index)}>
                <span className={styles.text}>{item}</span>
                <span className={styles.line}></span>
              </li>
            })}
          </ul>
          {/* <p style={{display: oprateIdx === 0 ? 'block' : 'none'}} className={styles.oprate}>{formatMessage({id: 'trading.bottom.cancellations'})}</p> */}
        </div>
      </div>
    )
  }
}
Bottom.defaultProps = {
  list: [],
  idx: 0
}

export default connect(({ trading }) => ({
  trading,
}))(Bottom);
