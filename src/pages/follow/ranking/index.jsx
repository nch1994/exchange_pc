import React, { Component } from 'react';
import styles from './index.less';
import router from 'umi/router';
import { Modal, Empty } from 'antd';
import defaultIcon from '@/assets/image/default.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { getCookie, decryptByDES } from '@/utils/utils';
import NodataIcon from '@/assets/image/nodata.png';
import { Scrollbars } from 'react-custom-scrollbars';

class Ranking extends Component {
  state = {
  };
  confirm(traderId, nickName) {
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      Modal.confirm({
        title: `${formatMessage({id: 'notice'})}`,
        content: `${formatMessage({id: 'notice.login'})}`,
        okText: `${formatMessage({id: 'confirm'})}`,
        cancelText: `${formatMessage({id: 'cancel'})}`,
        onOk() {
          router.push('/user/login')
        },
      });
      return false;
    }
    this.props.onConfirmAdd(traderId, nickName)
  }
  cancelFollow(recId) {
    this.props.onCancelFollow(recId)
  }
  
  render () {
    const { follow: { rankingList }, modifyInfo, recId } = this.props;
    const scrollRight = window.innerHeight - 100 - 51;
    const userId = decryptByDES(getCookie('token')) || '';
    const rankingItem = rankingList.map((item, index) => {
      return <li key={index} className={styles.item}>
        <div className={styles.icon}>
          <img src={item.icon || defaultIcon} alt=""/>
        </div>
        <div className={styles.others}>
          <div className={styles.info}>
            <p className={styles.name}>{item.nickName}</p>
            <p className={styles.hasAuth}>{item.front ? `${formatMessage({id: 'community.hasAuth'})}` : `${formatMessage({id: 'community.notAuth'})}`}</p>
            <div className={styles.btns}>
              {
                modifyInfo && modifyInfo.traderId !== item.userId
                ? <button className={`${styles.btn} ${parseInt(item.userId) === parseInt(userId) ? styles.disabled : '' }`} onClick={() => this.confirm(item.userId, item.nickName)}>
                    {formatMessage({id: 'community.follow'})}
                  </button>
                : <button className={`${styles.btn}`} onClick={() => this.cancelFollow(recId)}>
                    {formatMessage({id: 'community.cancel'})}
                  </button>
              }
            </div>
          </div>
          <div className={styles.tags} style={{display: item.tagsArr.length > 0 ? 'flex' : 'none'}}>
            {item.tagsArr.map((element, idx) => {
              return <p key={idx}>{element}</p>
            })}
          </div>
          <ul className={styles.details}>
            <li><p>{formatMessage({id: 'community.totalRate'})}</p><p>{item.profit || 0}</p></li>
            <li><p>{formatMessage({id: 'community.win'})}</p><p>{item.win || 0}</p></li>
            <li><p>{formatMessage({id: 'community.maxBack'})}</p><p>{item.defeat}</p></li>
            <li><p>{formatMessage({id: 'community.days'})}</p><p>{item.days || 0}</p></li>
            <li><p>{formatMessage({id: 'community.numbers'})}</p><p>{item.number || 0}</p></li>
            <li><p>{formatMessage({id: 'community.peoples'})}</p><p>{item.peoples || 0}</p></li>
          </ul>
        </div>
      </li>
    })

    return (
      <div className={styles.wrap}>
        <Scrollbars style={{height: scrollRight,}}>
          <ul className={styles.rank} style={{display: rankingList.length > 0 ? 'block' : 'none'}}>
            {rankingItem}
          </ul>
          <div style={{display: rankingList.length < 1 ? 'flex' : 'none', backgroundColor: '#ffffff', minHeight: '240px', alignItems: 'center', justifyContent: 'center'}}>
            <Empty image={NodataIcon} description={formatMessage({id: 'noData'})} />
          </div>
        </Scrollbars>
      </div>
    )
  }
}

export default connect(({ follow, global }) => ({
  follow, global
}))(Ranking);