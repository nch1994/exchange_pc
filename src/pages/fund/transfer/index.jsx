import React, { Component, createRef } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import BottomIcon from '@/assets/image/bottom_black.png';
import TransferIcon from '@/assets/image/fund/transfer.png';
import { showErrorMessage, getCookie, filterPoint, decryptByDES } from '@/utils/utils';
import { Table, Modal } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import numeral from 'numeral';
import DefaultIcon from '@/assets/image/fund/default.png';
class Transfer extends Component {
  constructor (props) {
    super(props);
    this.countRef = createRef();
    this.state = {
      isShowTransferList: false,
      curIndex: 0,
      isShowList: false,
      useable: 0,
      transferType: 0, // 资产账户0 资金账户1
      transferIdx: 0,
      pageNum: 1
    }
  };
  componentDidMount() {
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const transferInfo = JSON.parse(sessionStorage.getItem('transferInfo'));
    
    let curIndex = 0, transferType = 0, transferIdx = 0;
    if (transferInfo) {
      if (parseInt(transferInfo.transfer) === 0 || parseInt(transferInfo.transfer) === 1) {
        transferType = parseInt(transferInfo.transfer)
      }
      curIndex = accountDetails.findIndex((item) => {
        return parseInt(item.coinType) === parseInt(transferInfo.coinType);
      })
      transferIdx = coinContracts[curIndex].contractAccountList.findIndex((item) => {
        return parseInt(item.contId) === parseInt(transferInfo.contId);
      })
    } else {
      transferType = 1;
      curIndex = 0;
      transferIdx = 0;
    }
    let point = parseInt(transferType) === 0 ? 4 : 8;
    this.setState({
      transferType,
      curIndex,
      transferIdx,
      useable: parseInt(transferType) === 0 ? filterPoint(coinContracts[curIndex].contractAccountList[transferIdx].balance, point) : filterPoint(accountDetails[curIndex].amount, point),
      pageNum: 1
    }, () => {
      this.getTrades()
    })
    let self = this;
    this._onBlurHandler(self)
  }
  _onBlurHandler(self) {
    document.body.addEventListener('click', function (e) {
      //针对不同浏览器的解决方案
      function matchesSelector(element, selector) {
        if (element.matches) {
          return element.matches(selector);
        } else if (element.matchesSelector) {
          return element.matchesSelector(selector);
        } else if (element.webkitMatchesSelector) {
          return element.webkitMatchesSelector(selector);
        } else if (element.msMatchesSelector) {
          return element.msMatchesSelector(selector);
        } else if (element.mozMatchesSelector) {
          return element.mozMatchesSelector(selector);
        } else if (element.oMatchesSelector) {
          return element.oMatchesSelector(selector);
        }
      }
      //匹配当前组件内的所有元素
      if (matchesSelector(e.target, '.chargeWrap *')) {
        return;
      }
      self.setState({
        isShowList: false,
        isShowTransferList: false
      })
    }, false);
  }
  componentWillUnmount() {
    sessionStorage.removeItem('transferInfo')
  }
  getTrades() {
    const { dispatch, fund: { pageSize } } = this.props;
    const { curIndex, pageNum } = this.state;
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const userId = decryptByDES(getCookie('token'));
    const data = `userId=${userId}&category=3&pageNum=${pageNum}&pageSize=${pageSize}&coinType=${coinContracts[curIndex].coinType}`;
    dispatch({
      type: 'fund/tradeRecords',
      payload: data
    })
  }
  changeTransferType() {
    const { transferType, transferIdx, curIndex } = this.state;
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const newTransferType = parseInt(transferType) === 0 ? 1 : 0;
    let point = parseInt(newTransferType) === 0 ? 4 : 8;
    this.countRef.current.value = ''
    this.setState({
      useable: parseInt(newTransferType) === 0 ? filterPoint(coinContracts[curIndex].contractAccountList[transferIdx].balance, point) : filterPoint(accountDetails[curIndex].amount, point),
      transferType: newTransferType,
      isShowTransferList: false,
    })
  }
  all() {
    const { useable } = this.state;
    this.countRef.current.value = useable;
  }
  confirm() {
    const { useable, curIndex, transferType, transferIdx } = this.state;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token'));
    const coinType = accountDetails[curIndex].coinType;
    const fundsTransfer = parseInt(transferType) === 0 ? 2 : 1;
    const contractType = coinContracts[curIndex].contractAccountList[transferIdx].contId;
    const amount = this.countRef.current.value;
    if (userId === '') {
      Modal.confirm({
        title: 'Confirm',
        content: `${formatMessage({id: 'notice.login'})}`,
        okText: `${formatMessage({id: 'confirm'})}`,
        cancelText: `${formatMessage({id: 'cancel'})}`,
        onOk() {
          router.push('/user/login')
        },
      });
      return false;
    }
    if (numeral(amount)._value > numeral(useable)._value) {
      showErrorMessage(`${formatMessage({id: 'notice.transfer.upper'})}`);
      return false;
    }
    if (numeral(amount)._value <= 0) {
      showErrorMessage(`${formatMessage({id: 'notice.transfer.lower'})}`);
      return false;
    }
    dispatch({
      type: 'fund/fundsTransfer',
      payload: { amount, coinType, contractType, fundsTransfer, userId },
      callback: () => {
        dispatch({
          type: 'fund/getDetails',
          payload: { userId, coinType }
        })
        this.setState({
          pageNum: 1
        }, () => {
          this.getTrades();
        })
        this.countRef.current.value = '';
        let newUseable = 0;
        let point = parseInt(transferType) === 0 ? 4 : 8;
        if (parseInt(transferType) === 1) {
          accountDetails[curIndex].amount = numeral(accountDetails[curIndex].amount)._value - numeral(amount)._value;
          coinContracts[curIndex].contractAccountList[transferIdx].balance = numeral(coinContracts[curIndex].contractAccountList[transferIdx].balance)._value + numeral(amount)._value;
          newUseable = filterPoint(accountDetails[curIndex].amount, point);
        } else {
          coinContracts[curIndex].contractAccountList[transferIdx].balance = numeral(coinContracts[curIndex].contractAccountList[transferIdx].balance)._value - numeral(amount)._value;
          accountDetails[curIndex].amount = numeral(accountDetails[curIndex].amount)._value + numeral(amount)._value;
          newUseable = filterPoint(coinContracts[curIndex].contractAccountList[transferIdx].balance, point)
        }
        this.countRef.current.value = '';
        sessionStorage.setItem('coinContracts', JSON.stringify(coinContracts));
        sessionStorage.setItem('accountDetails', JSON.stringify(accountDetails));
        this.setState({
          useable: newUseable
        })
      }
    })
  }
  changeCount(event) {
    const { transferType } = this.state;
    event.target.value = event.target.value.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
    event.target.value = event.target.value.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    event.target.value = parseInt(transferType) === 0 ? event.target.value.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/, '$1$2.$3') : event.target.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    event.target.value = event.target.value.replace('.', '$#$').replace(/\./g,"").replace('$#$', '.');
    if(event.target.value.indexOf('.')< 0 && event.target.value !== ''){ //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      event.target.value= parseFloat(event.target.value);
    }
  }
  changePage(pagination) {
    this.setState({
      pageNum: pagination.current
    }, () => {
      this.getTrades()
    })
  }
  changeCurIndex(index) {
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const { transferType } = this.state;
    let point = parseInt(transferType) === 0 ? 4 : 8;
    this.countRef.current.value = ''
    this.setState({
      curIndex: index,
      isShowList: false,
      transferIdx: 0,
      useable: parseInt(transferType) === 0 ? filterPoint(coinContracts[index].contractAccountList[0].balance, point): filterPoint(accountDetails[index].amount, point),
      pageNum: 1
    }, () => {
      this.getTrades()
    })
  }
  changeTransferListIdx(index) {
    const { curIndex, transferType } = this.state;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    this.countRef.current.value = parseInt(transferType) === 1 ? this.countRef.current.value : ''
    let point = parseInt(transferType) === 0 ? 4 : 8;
    this.setState({
      transferIdx: index,
      isShowTransferList: false,
      useable: parseInt(transferType) === 0 ? filterPoint(coinContracts[curIndex].contractAccountList[index].balance, point) : filterPoint(accountDetails[curIndex].amount, point),
    })
  }
  showList() {
    this.setState({
      isShowList: !this.state.isShowList
    })
  }
  showTransferList() {
    this.setState({
      isShowTransferList: !this.state.isShowTransferList
    })
  }
  render () {
    const columns = [
      {
        title: `${formatMessage({id: 'currency'})}`,
        dataIndex: 'coinName',
        key: 'coinName',
      },
      {
        title: `${formatMessage({id: 'fund.transfer.count'})}`,
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: `${formatMessage({id: 'fund.transfer.from'})}`,
        dataIndex: 'transferFrom',
        key: 'transferFrom',
      },
      {
        title: `${formatMessage({id: 'fund.transfer.to'})}`,
        dataIndex: 'transferTo',
        key: 'transferTo',
      },
      {
        title: `${formatMessage({id: 'fund.transfer.time'})}`,
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
      },
      {
        title: `${formatMessage({id: 'fund.transfer.status'})}`,
        dataIndex: 'state',
        key: 'state',
      }
    ];
    const { isShowTransferList, curIndex, isShowList, useable, transferType, transferIdx } = this.state;
    const { fund: { loading, pagination, tradeRecords } } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const accountItem = accountDetails.map((element, index) => {
      return (
        <li key={index} onClick={() => this.changeCurIndex(index)}>
          <img src={element.icon || DefaultIcon } alt=""/>
          <p>{element.enName || ''}</p>
        </li>
      )
    })
    return (
      <div className={styles.chargeWrap}>
        <div className={styles.chargeTop}>
          <div className={styles.chargeTopTitle}>
            <span>{formatMessage({id: 'transfer'})}</span>
          </div>
          <div className={styles.chargeNotice}>
            <span></span>
            <p>{formatMessage({id: 'fund.transfer.notice'})}</p>
          </div>
          <ul className={styles.form}>
            <li>
              <label htmlFor="">{formatMessage({id: 'currency'})}</label>
              <div className={styles.transferUSDT} onClick={this.showList.bind(this)} style={{cursor: 'pointer'}}>
                <img src={accountDetails[curIndex] ? accountDetails[curIndex].icon : DefaultIcon} className={styles.types} alt=""/>
                  <input type="text" value={accountDetails[curIndex] ? accountDetails[curIndex].enName : 'USDT(OMNI)'} readOnly style={{cursor: 'pointer'}} />
                  <img src={BottomIcon} className={styles.icon} alt=""/>
                </div>
                <ul className={styles.list} style={{display: isShowList ? 'block' : 'none'}}>
                  {accountItem} 
                </ul>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'fund.transfer.direction'})}</label>
              <div className={styles.transferInput}>
                {
                  parseInt(transferType) === 0
                  ? <div className={styles.transferDiv}>
                      <div onClick={this.showTransferList.bind(this)} style={{cursor: 'pointer', border: 'none'}}>
                        <span>{coinContracts[curIndex].contractAccountList[transferIdx].contName}{parseInt(coinContracts[curIndex].contractAccountList[transferIdx].contId) > 100 ? formatMessage({id:'guess.option'}) : ''}</span>
                        <img src={BottomIcon} alt=""/>
                      </div>
                      <ul style={{display: isShowTransferList ? 'block' : 'none'}}>
                        {coinContracts[curIndex].contractAccountList.map((item, index) => {
                          return <li key={index} onClick={this.changeTransferListIdx.bind(this, index)}>{item.contName}{parseInt(item.contId) > 100 ? formatMessage({id:'guess.option'}) : ''}</li>
                        })}
                      </ul>
                    </div>
                  : <div className={styles.transferDiv}>{formatMessage({id: 'fund.transfer.wallet'})}</div>
                }
                <img src={TransferIcon} alt="" onClick={() => this.changeTransferType()} className={styles.transferIcon} />
                {
                  parseInt(transferType) === 1
                  ? <div className={styles.transferDiv}>
                      <div onClick={this.showTransferList.bind(this)} style={{cursor: 'pointer', border: 'none'}}>
                        <span>{coinContracts[curIndex].contractAccountList[transferIdx].contName}{parseInt(coinContracts[curIndex].contractAccountList[transferIdx].contId) > 100 ? formatMessage({id:'guess.option'}) : ''}</span>
                        <img src={BottomIcon} alt=""/>
                      </div>
                      <ul style={{display: isShowTransferList ? 'block' : 'none'}}>
                        {coinContracts[curIndex].contractAccountList.map((item, index) => {
                          return <li key={index} onClick={this.changeTransferListIdx.bind(this, index)}>{item.contName}{parseInt(item.contId) > 100 ? formatMessage({id:'guess.option'}) : ''}</li>
                        })}
                      </ul>
                    </div>
                  : <div className={styles.transferDiv}>{formatMessage({id: 'fund.transfer.wallet'})}</div>
                }
               </div> 
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'fund.transfer.count'})}</label>
              <div>
                <input type="text" placeholder={formatMessage({id: 'input.transfer.count'})} ref={this.countRef} onChange={this.changeCount.bind(this)} />
              </div>
            </li>
          </ul>
          <p className={styles.count}>
            <span>{formatMessage({id: 'fund.transfer.convertible'})}</span>
            <span style={{paddingLeft: '10px', paddingRight: '10px'}}>{useable}</span>
            <span style={{color: '#007AFF', cursor: 'pointer'}} onClick={() => this.all()}>{formatMessage({id: 'fund.transfer.all.convertible'})}</span>
            </p>
          <button className={styles.btn} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
        </div>
        <div className={styles.chargeBottom}>
          <div className={styles.chargeBottomTitle}>{formatMessage({id: 'fund.transfer.title'})}</div>
          <Table align="center" loading={loading} columns={columns} dataSource={tradeRecords} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
        </div>
      </div>
    )
  }
}

Transfer.defaultProps = { }
export default connect(({ fund, global }) => ({
  fund, global
}))(Transfer);