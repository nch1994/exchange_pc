import React, { Component } from 'react';
import styles from './index.less';
import BgIcon from '@/assets/image/share/bg.png';
import LeftIcon from '@/assets/image/share/left.png';
import RightIcon from '@/assets/image/share/right.png';
import TriggleIcon from '@/assets/image/share/triggle.png';
import RankTop01 from '@/assets/image/share/top01.png';
import RankTop02 from '@/assets/image/share/top02.png';
import RankTop03 from '@/assets/image/share/top03.png';
import { showErrorMessage, showSuccessMessage, getCookie, filterPoint, decryptByDES, removeCookie } from '@/utils/utils';
import copy from 'copy-to-clipboard';
import QRCode from 'qrcode.react';
import { Table, Select } from 'antd';
import { formatMessage } from 'umi/locale';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import router from 'umi/router';
const { Option } = Select;


class Share extends Component {
  state = {
    contractList: [],
    contractIdx: 0,
    curIndex: 0,
    unit: 'USDT',
    inviteNum: 0
  }
  componentDidMount() {
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }

    dispatch({
      type: 'global/getContracts',
      callback: () => {
        let contractsList = localStorage.getItem('contractsList') ? JSON.parse(localStorage.getItem('contractsList')) : {};
        contractsList = contractsList.filter((element) => {
          return element.contId < 41
        })
        this.setState({
          contractList: contractsList,
          unit: contractsList[0].contName.indexOf('USDT') > -1 ? 'USDT' : contractsList[0].contName.split('/')[0]
        });
        this.getUserReward(0);
        this.getRewardRank(0, 0);
      }
    });
    dispatch({
      type: 'share/getInviteNum',
      payload: `${userId}`,
      callback: (obj) => {
        this.setState({
          inviteNum: obj
        })
      }
    })
  }
  changeIdx(index) {
    const { contractIdx } = this.state;
    this.setState({
      curIndex: index
    })
    this.getRewardRank(index, contractIdx);
  }
  getUserReward(index) {
    const { dispatch } = this.props;
    const { contractList } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }
    dispatch({
      type: 'share/getUserReward',
      payload: `${userId}?contId=${contractList[index].contId}`
    })
  }
  getRewardRank(curIndex, contractIdx) {
    const { dispatch } = this.props;
    const { contractList } = this.state;
    // 1为总奖励 2为今日
    const type = curIndex === 0 ? 1 : 2;
    dispatch({
      type: 'share/getReward',
      payload: `${type}?contId=${contractList[contractIdx].contId}`
    })
  }
  changeContractIdx (index) {
    const { curIndex, contractList } = this.state;
    this.setState({
      contractIdx: index,
      unit: contractList[index].contName.indexOf('USDT') > -1 ? 'USDT' : contractList[index].contName.split('/')[0]
    })
    this.getUserReward(index);
    this.getRewardRank(curIndex, index)
  };
  copyCode() {
    const userInfo = JSON.parse(getCookie('userInfo')) || {};
    if(copy(userInfo.myInviteCode)) {
      showSuccessMessage(`${formatMessage({id: 'copySuccess'})}`);
    }else{
      showErrorMessage(`${formatMessage({id: 'copyError'})}`);
    }
  }
  render() {
    const { share: { userReward, rewardList } } = this.props;
    const { contractList, contractIdx, curIndex, unit, inviteNum } = this.state;
    if (contractList.length < 1) {
      return null;
    }
    const userInfo = JSON.parse(getCookie('userInfo')) || {};
    const listTitle = [`${formatMessage({id: 'share.total.reward.ranking'})}`];
    const columns = [
      {
        title: `${formatMessage({id: 'share.rank'})}`,
        dataIndex: 'rank',
        key: 'rank',
        render: rank => {
          return <div>
            <img style={{display: rank === '1' ? 'block' : 'none'}} className={styles.rankTopIcon} src={RankTop01} alt=""/>
            <img style={{display: rank === '2' ? 'block' : 'none'}} className={styles.rankTopIcon} src={RankTop02} alt=""/>
            <img style={{display: rank === '3' ? 'block' : 'none'}} className={styles.rankTopIcon} src={RankTop03} alt=""/>
            <span>{rank}</span>
          </div>
        }
      },
      {
        title: `${formatMessage({id: 'user'})}`,
        dataIndex: 'mobile',
        key: 'mobile',
      },
      {
        title: `${formatMessage({id: 'share.reward'})}(${unit})`,
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return <span>{filterPoint(amount, 8)}</span>
        }
      },
      // {
      //   title: `${formatMessage({id: 'share.change'})}`,
      //   key: 'change',
      //   dataIndex: 'change',
      //   render: (change) => {
      //     return <div>
      //       <img src={change.icon} className={styles.trendIcon} alt=""/>
      //       <span className={styles.trendCount} style={{color: change.color}}>{change.drift}</span>
      //     </div>
      //   }
      // }
    ];
    const rankList = [{
      // "amount": 今日奖励, "rank": 总排行, "drift": 日排行
      text: `${formatMessage({id: 'share.my.total.reward.ranking'})}`,
      count: userReward ? userReward.rank : 0
    }, {
      text: `${formatMessage({id: 'share.my.daily.reward.ranking'})}`,
      count: userReward ? userReward.drift : 0
    }, {
      text: `${formatMessage({id: 'share.today.reward'})}`,
      count: userReward ? userReward.amount : 0
    }];
    const OptionItem = contractList.map((item, index) => {
      return <Option value={index} key={index}>{ item.contName }{formatMessage({id: 'perpetual'})}</Option>
    })
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'share'})}`}>
        <div className={styles.share}>
          <div className={styles.top}>
            <div className={styles.topInfo}>
              <div className={styles.topInfoLeft}>
                <img src={BgIcon} alt=""/>
              </div>
              <div className={styles.topInfoRight}>
                <p>{formatMessage({id: 'share.top.title'})}</p>
                <p>{formatMessage({id: 'share.top.subTitle'})}</p>
                <p>2019-11-07 {formatMessage({id: 'share.top.to'})} 2020-12-31</p>
              </div>
            </div>
          </div>
          <div className={styles.title}>
            <img src={LeftIcon} alt=""/>
            <span>{formatMessage({id: 'share.my.invite.way'})}</span>
            <img src={RightIcon} alt=""/>
          </div>
          <div className={styles.inviteWay}>
            <div className={styles.inviteNum}>{formatMessage({id: 'share.my.invite.count'})}: {inviteNum} </div>
            <ul>
              <li className={styles.inviteWayFirst}>
                <div className={styles.inviteTop}>
                  <img src={TriggleIcon} alt=""/>
                  <p>{formatMessage({id: 'share.way1'})}</p>
                </div>
                <div className={styles.inviteBottom}>
                  <div className={styles.inviteBottomTitle}>
                    <p>{formatMessage({id: 'share.invite.code'})}</p>
                    <span className={styles.myInviteCode}>{userInfo.myInviteCode}</span>
                  </div>
                  <button className={styles.inviteBottomBtn} onClick={() => this.copyCode()}>{formatMessage({id: 'share.copy'})}</button>
                </div>
              </li>
              <li className={styles.inviteWaySecond}>
                <div className={styles.inviteTop}>
                  <img src={TriggleIcon} alt=""/>
                  <p>{formatMessage({id: 'share.way2'})}</p>
                </div>
                <div className={styles.inviteBottom}>
                  <div className={styles.inviteBottomTitle}>
                    <QRCode value={`https://h5.starqueen.top/register?inviteCode=${userInfo.myInviteCode || ''}`} width={140} height={140} className={styles.inviteBottomCode} />
                  </div>
                  <span className={styles.inviteBottomNotice}>{formatMessage({id: 'share.code'})}</span>
                </div>
              </li>
            </ul>
          </div>
          
          
          <div className={styles.title}>
            <img src={LeftIcon} alt=""/>
            <span>{formatMessage({id: 'share.rank.list'})}</span>
            <img src={RightIcon} alt=""/>
          </div>
          
          <div className={styles.rankList}>
            <div className={styles.rankListTitle}>
              <p>{formatMessage({id: 'chooseCont'})}：</p>
              <Select defaultValue={contractList[contractIdx].contName + formatMessage({id: 'perpetual'})} onChange={(e)=>this.changeContractIdx(e)}>
                {OptionItem}
              </Select>
            </div>
            
            <ul className={styles.rankTopList}>
              {rankList.map((item, index) => {
                return <li key={index}>
                  <p className={styles.text}>{item.text}</p>
                  <p className={styles.line}></p>
                  <p className={styles.count} style={{display: index < 2 && item.count > 99 ? 'block' : 'none'}}>99<span>+</span></p>
                  <p className={styles.count} style={{display: index < 2 && item.count < 99 ? 'block' : 'none'}}>{item.count}</p>
              <p className={styles.count} style={{display: index === 2 ? 'block' : 'none'}}>{item.count}<span>{unit}</span></p>
                </li>
              })}
            </ul>
            <div className={styles.list}>
              <ul className={styles.listTitle}>
                {listTitle.map((item, index) => {
                return <li key={index} className={curIndex === index ? styles.active : ''} onClick={() => this.changeIdx(index)}>
                  <span className={styles.text}>{item}</span>
                  <span className={styles.line} />
                </li>
                })}
              </ul>
              <div>
                <Table columns={columns} dataSource={rewardList} className={styles.table} />
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}


export default connect(({ share, global }) => ({
  share, global
}))(Share);