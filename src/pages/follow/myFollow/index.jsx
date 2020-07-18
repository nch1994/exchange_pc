import React, { Component } from 'react';
import styles from './index.less';
import { Empty } from 'antd';
import defaultIcon from '@/assets/image/default.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import NodataIcon from '@/assets/image/nodata.png';
import EditFollow from '../editFollow';

class MyFollow extends Component {
  state = {
    modifyIdx: -1
  };
  cancelFollow(recId) {
    this.props.onCancelFollow(recId)
  }
  cancelModify() {
    this.setState({
      modifyIdx: -1
    })
  }
  confirmModify() {
    this.setState({
      modifyIdx: -1
    })
    this.props.onConfirmModify();
  }
  showEditFollow(info, index) {
    this.setState({
      modifyIdx: index
    }, () => {
      this.props.onEditFollow(info);
    })
  }
  render () {
    const { follow: { followList }, modifyInfo } = this.props;
    const { modifyIdx } = this.state;
    const rankingItem = followList.map((item, index) => {
      return <li key={index} className={styles.item}>
        <div className={styles.item1}>
          <div className={styles.icon}>
            <img src={item.icon || defaultIcon} alt=""/>
          </div>
          <div className={styles.others}>
            <div className={styles.info}>
              <p className={styles.name}>{item.nickName}<span>({item.contName})</span></p>
              <p className={styles.hasAuth}>{item.front ? `${formatMessage({id: 'community.hasAuth'})}` : `${formatMessage({id: 'community.notAuth'})}`}</p>
              <div className={styles.btns}>
                <button className={`${styles.btn}`} onClick={() => this.showEditFollow(item, index)}>
                  {formatMessage({id: 'community.modify'})}
                </button>
                <button className={`${styles.btn}`} onClick={() => this.cancelFollow(item.recId)}>
                  {formatMessage({id: 'community.cancel'})}
                </button>
              </div>
            </div>
            <ul className={styles.details}>
              <li><p>{formatMessage({id: 'community.total.money'})}({item.unit})</p><p>{item.bond || 0}</p></li>
              <li><p>{formatMessage({id: 'community.earnings'})}({item.unit})</p><p>{item.profit || 0}</p></li>
              {
                item.recType === 1
                ? <li><p>{formatMessage({id: 'community.money'})}({item.unit})</p><p>{item.sheet || 0}</p></li>
                : <li><p>{formatMessage({id: 'community.unit'})}(%)</p><p>{item.scale || 0}</p></li>
              }
              <li><p>{formatMessage({id: 'community.today.money'})}({item.unit})</p><p>{item.dailyMax || 0}</p></li>
            </ul>
          </div>
        </div>
        <div style={{display: index === modifyIdx ? 'block' : 'none'}}>
          <EditFollow modifyInfo={modifyInfo} onCancelModify={() => this.cancelModify()} onConfirmModify={() => this.confirmModify()} titleIdx={1} />
        </div>
      </li>
    })
    return (
      <div className={styles.wrap}>
        <ul className={styles.rank} style={{display: followList.length > 0 ? 'block' : 'none'}}>
          {rankingItem}
        </ul>
        <div style={{display: followList.length < 1 ? 'flex' : 'none', backgroundColor: '#ffffff', minHeight: '240px', alignItems: 'center', justifyContent: 'center'}}>
          <Empty image={NodataIcon} description={formatMessage({id: 'noData'})} />
        </div>
      </div>
    )
  }
}

export default connect(({ follow, global }) => ({
  follow, global
}))(MyFollow);