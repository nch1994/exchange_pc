import React, { Component } from 'react';
import styles from './index.less';
import router from 'umi/router';
import { Modal } from 'antd';
import searchIcon from '@/assets/image/search.png';
import { formatMessage } from 'umi/locale';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import LeftCont from './leftCont';
import Ranking from './ranking';
import FollowLayer from './followLayer'
import Agree from './agree';
import MyFollow from './myFollow';
import MyLeader from './myLeader';
import { baseUrl, getCookie, showErrorMessage, decryptByDES, removeCookie } from '@/utils/utils';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
let priceSource, priceSourceTimer = null;

class Follow extends Component {
  state = {
    contractIdx: 0,
    isShowLayer: false,
    traderId: 0,
    nickName: '',
    recId: '',
    modifyInfo: {},
    curIndex: 0,
    isShowAgree: false,
    value1: '',
    value2: '',
    value3: '',
    searchValue: '',
    titleList: [formatMessage({id: 'community.rankTile'}), formatMessage({id: 'community.myFollow'}), formatMessage({id: 'leader.title'})],
    titleIdx: 0,
    hasFollow: false
  };
  componentDidMount() {
    const { contractIdx } = this.state;
    this.getPirceSource();
    this.getRankList(contractIdx);
    this.getQueryOnly(contractIdx);
    this.getMyFollow();
    this.getLeaderInfo(contractIdx)
  };
  handleContractIdx(index) {
    this.setState({
      contractIdx: index,
      modifyInfo: {},
      recId: '',
      hasFollow: false
    })
    this.getRankList(index);
    this.getQueryOnly(index);
    this.getLeaderInfo(index);
  }
  getLeaderInfo(index) {
    const { dispatch, global: { contractList } } = this.props;
    const userId = decryptByDES(getCookie('token'));
    const { titleIdx } = this.state;
    if (userId === '') return;
    if (titleIdx !== 2) return;
    const data = `contId=${contractList[index].contId}&userId=${userId}`
    dispatch({
      type: 'follow/getLeaderInfo',
      payload: data
    })
  }
  getMyFollow() {
    const userId = decryptByDES(getCookie('token')) || '';
    const { dispatch } = this.props;
    const { titleIdx } = this.state;
    if (titleIdx !== 1) return;
    if (userId !== '') {
      dispatch({
        type: 'follow/queryAll',
        payload: `userId=${userId}`
      })
    } else {
      dispatch({
        type: 'follow/setRanking',
        payload: []
      })
    }
  }
  getQueryOnly(index) {
    const userId = decryptByDES(getCookie('token')) || '';
    const { global: { contractList }, dispatch } = this.props;
    const { titleIdx } = this.state;
    if (userId === '') return;
    if (titleIdx !== 0) return;
    const data = `userId=${userId}&contId=${contractList[index].contId}`
    dispatch({
      type: 'follow/queryOnly',
      payload: data,
      callback: (obj) => {
        const recId = obj ? obj.recId : '';
        this.setState({
          recId: recId
        })
        if (recId !== '') {
          this.setState({
            modifyInfo: obj,
            hasFollow: true
          })
        }
      }
    })
  }
  changeTitleIdx(index) {
    this.setState({
      titleIdx: index,
      hasFollow: false
    }, () => {
      const { contractIdx } = this.state;
      this.getRankList(contractIdx);
      this.getQueryOnly(contractIdx);
      this.getMyFollow();
      this.getLeaderInfo(contractIdx)
    })
  }
  componentWillUnmount() {
    clearTimeout(priceSourceTimer);
    priceSource.close()
  }
  getRankList(index) {
    const { dispatch, global: { contractList } } = this.props;
    const { titleIdx } = this.state;
    if (titleIdx !== 0) return;
    const data = contractList[index].contId;
    dispatch({
      type: 'follow/getRanking',
      payload: data
    })
  }
  
  getPirceSource() {
    const _this = this;
    const { dispatch } = this.props;
    const EventSource = NativeEventSource || EventSourcePolyfill;
    priceSource = new EventSource(`${baseUrl}sse/coinPrices`);
    priceSource.onmessage = function (event) {
      const obj = JSON.parse(event.data)
      dispatch({
        type: 'global/getCoinsPrice',
        payload: obj
      })
    };
    priceSource.onerror = function (event) {
      priceSource.close()
      priceSourceTimer = setTimeout(() => {
        _this.getPirceSource()
        clearTimeout(priceSourceTimer);
      }, 3000)
    }
  }

  handleConfirmAdd(traderId, nickName) {
    const { hasFollow } = this.state;
    const _this = this;
    if (hasFollow) {
      Modal.confirm({
        title: `${formatMessage({id: 'notice'})}`,
        content: `${formatMessage({id: 'community.follow.notice'})}`,
        okText: `${formatMessage({id: 'confirm'})}`,
        cancelText: `${formatMessage({id: 'cancel'})}`,
        onOk() {
          _this.setState({
            titleIdx: 1
          }, () => {
            _this.getMyFollow();
          });
        },
      });
      return false
    }
    this.setState({
      isShowLayer: true,
      traderId: traderId,
      nickName: nickName
    })
  }
  handelCancelFollow (recId) {
    const { dispatch } = this.props;
    const { contractIdx } = this.state;
    const data = {
      recId: recId
    }
    dispatch({
      type: 'follow/cancelFollow',
      payload: data,
      callback: () => {
        this.setState({
          recId: '',
          modifyInfo: {},
          hasFollow: false
        })
        this.getRankList(contractIdx);
        this.getMyFollow();
        this.getLeaderInfo(contractIdx);
      }
    })
  }
  addFollow() {
    const { nickName, contractIdx, traderId, curIndex, value1, value2, value3 } = this.state;
    const { global: { contractList }, dispatch } = this.props
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }
    const data = {
      nickName: nickName,
      contId: contractList[contractIdx].contId,
      recType: parseInt(curIndex) + 1,  // recType  1是固定数量2是比例
      scale: value2,
      sheet: value1,
      dailyMax: value3,
      traderId: traderId,
      userId: userId
    }
    dispatch({
      type: 'follow/addFollow',
      payload: data,
      callback: () => {
        this.setState({
          isShowLayer: false,
          isShowAgree: false
        })
        this.getQueryOnly(contractIdx)
      }
    })
  }
  showAgree(curIndex, value1, value2, value3) {
    this.setState({
      isShowAgree: true,
      curIndex: curIndex,
      value1: value1,
      value2: value2,
      value3: value3
    })
  }
  getSearch(event) {
    this.setState({
      searchValue: event.target.value
    })
  }
  search() {
    const { searchValue, contractIdx } = this.state;
    const { dispatch, global: { contractList } } = this.props;
    if (searchValue.length < 1) {
      showErrorMessage(`${formatMessage({id: 'community.search.notice'})}`);
      return;
    }
    const data = `${contractList[contractIdx].contId}?userId=${searchValue}`;
    dispatch({
      type: 'follow/getRanking',
      payload: data
    })
  }
  cancel() {
    this.setState({
      isShowLayer: false,
      isShowAgree: false
    })
  }
  handelConfirmModify() {
    this.getMyFollow();
  }
  handleEditFollow(info) {
    this.setState({
      modifyInfo: info
    })
  }
  render () {
    const { contractIdx, nickName, isShowLayer, traderId, isShowAgree, titleIdx, titleList, modifyInfo, recId } = this.state;
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'community.title'})}`}>
        <div className={styles.centerWrap}>
          <div className={styles.center}>
            <div className={styles.left}>
              <LeftCont contractIdx={contractIdx} onContractIdx={this.handleContractIdx.bind(this)} />
            </div>
            <div className={styles.right}>
              <div className={styles.title}>
                <ul>
                  {titleList.map((item, index) => {
                    return <li key={index} className={titleIdx === index ? styles.active : ''} onClick={() => this.changeTitleIdx(index)}>{item}</li>
                  })}
                </ul>
                <div style={{display: titleIdx === 0 ? 'flex' : 'none'}}>
                  <img src={searchIcon} className={styles.icon} alt="" />
                  <input type="text" placeholder={formatMessage({id: 'community.search.placeHolder'})} onChange={this.getSearch.bind(this)} />
                  <button className={styles.btn} onClick={() => this.search()}>{formatMessage({id: 'community.search.btn'})}</button>
                </div>
              </div>
              <div style={{display: titleIdx === 0 ? 'block' : 'none'}}>
                <Ranking modifyInfo={modifyInfo} recId={recId} titleIdx={titleIdx} onConfirmAdd={this.handleConfirmAdd.bind(this)} onCancelFollow={this.handelCancelFollow.bind(this)} />
              </div>
              <div style={{display: titleIdx === 1 ? 'block' : 'none'}}>
                <MyFollow modifyInfo={modifyInfo} onCancelFollow={this.handelCancelFollow.bind(this)} onEditFollow={this.handleEditFollow.bind(this)} onConfirmModify={this.handelConfirmModify.bind(this)} />
              </div>
              <div style={{display: titleIdx === 2 ? 'block' : 'none'}}>
                <MyLeader contractIdx={contractIdx} />
              </div>
            </div>
          </div>
          <div style={{display: isShowLayer ? 'block' : 'none'}}>
            <FollowLayer onFollowLayer={this.showAgree.bind(this)} onCancel={this.cancel.bind(this)} nickName={nickName} traderId={traderId} contractIdx={contractIdx} />
          </div>
          <div style={{display: isShowAgree ? 'block' : 'none'}}>
            <Agree onAddFollow={this.addFollow.bind(this)} onCancel={this.cancel.bind(this)} />
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default connect(({ follow, global }) => ({
  follow, global
}))(Follow);