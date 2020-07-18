import styles from './index.less';
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Switch, Table, Modal } from 'antd';
import withRouter from 'umi/withRouter';
import router from 'umi/router';
import { getCookie, decryptByDES } from '@/utils/utils';

class MyLeader extends Component {
  componentDidMount() {
    this.getShareSwitch();
  }
  getShareSwitch() {
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token'));
    if (userId === '') return;
    const data = `${userId}`;
    dispatch({
      type: 'follow/getLead',
      payload: data
    })
  }
  changeSwitch (checked){
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token'));
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
    const follow = checked ? 1 : 0;
    dispatch({
      type: 'follow/setLead',
      payload: { follow, userId }
    })
  };
  render() {
    const { follow: { leaderInfo, shareAuth, leaderList }, global: { contractList }, contractIdx } = this.props;
    const columns = [{
      title: `${formatMessage({id: 'leader.types'})}`,
      dataIndex: 'recText',
      key: 'recText',
      render: () => {
        return <p>{contractList[contractIdx].contName}</p>
      }
    }, {
      title: `${formatMessage({id: 'leader.nickName'})}`,
      dataIndex: 'nickName',
      key: 'nickName',
    }, {
      title: `${formatMessage({id: 'leader.userId'})}`,
      dataIndex: 'userId',
      key: 'userId',
    }, {
      title: `${formatMessage({id: 'leader.open.price'})}`,
      dataIndex: 'openPrice',
      key: 'openPrice',
    }, {
      title: `${formatMessage({id: 'leader.close.price'})}`,
      dataIndex: 'closePrice',
      key: 'closePrice',
    }, {
      title: `${formatMessage({id: 'leader.close.amount'})}`,
      dataIndex: 'amount',
      key: 'amount',
    }, {
      title: `${formatMessage({id: 'leader.close.time'})}`,
      dataIndex: 'createTime',
      key: 'createTime',
    }, {
      title: `${formatMessage({id: 'leader.profit'})}`,
      dataIndex: 'royalty',
      key: 'royalty',
    }];
    return (
      <div className={styles.leader}>
        <div className={styles.rightTop}>
          <div className={styles.title}><p>{formatMessage({id: 'navBar.mine.leader'})}</p></div>
          <div className={styles.switch}>
            <p>{formatMessage({id: 'leader.switch.notice'})}</p>
            <Switch checked={parseInt(shareAuth) === 1} onChange={(value) => this.changeSwitch(value)}></Switch>
          </div>
          <ul className={styles.info}>
            <li><p>{formatMessage({id: 'leader.today'})}</p><p>{leaderInfo.today || '0.0000'}</p></li>
            <li><p>{formatMessage({id: 'leader.yesterday'})}</p><p>{leaderInfo.yesterday || '0.0000'}</p></li>
            <li><p>{formatMessage({id: 'leader.history'})}</p><p>{leaderInfo.profit || '0.0000'}</p></li>
            <li><p>{formatMessage({id: 'leader.peoples'})}</p><p>{leaderInfo.peoples || '0.0000'}</p></li>
            <li><p>{formatMessage({id: 'leader.numbers'})}</p><p>{leaderInfo.numbers || '0.0000'}</p></li>
          </ul>
        </div>
        <div className={styles.rightBottom}>
          <div className={styles.title}><p>{formatMessage({id: 'leader.details'})}</p></div>
          <Table align="center" className={styles.table} columns={columns} dataSource={leaderList || []}  />
        </div>
      </div>
    )
  }
}

export default withRouter(connect(({ follow, global }) => ({
  follow, global
}))(MyLeader));

