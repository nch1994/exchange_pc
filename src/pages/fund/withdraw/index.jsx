import React, { Component, createRef } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Table, Modal } from 'antd';
import numeral from 'numeral';
import { showErrorMessage, getCookie, decryptByDES } from '@/utils/utils';
import ConfirmWithdraw from '../confirmWithdraw/index';
import SettingFund from '../settingFund/index';
import router from 'umi/router';
import BottomIcon from '@/assets/image/bottom_black.png';
import DefaultIcon from '@/assets/image/fund/default.png';

class Withdraw extends Component {
  constructor (props) {
    super(props);
    this.countRef = createRef();
    this.feeRef = createRef();
    this.addressRef = createRef();
    this.memoRef = createRef();
    this.state = {
      curIndex: 0,
      isShowList: false,
      unit: '',
      pageNum: 1
    }
  };
  componentDidMount() {
    const { match: { params } } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    let index = 0;
    if (params && params.name) {
      index = accountDetails.findIndex((item) => {
        return item.enName === params.name;
      });
    }
    this.setState({
      curIndex: index < 0 ? 0 : index,
      unit: accountDetails[index < 0 ? 0 : index].enName,
      pageNum: 1
    }, () => {
      this.getTrades();
    })
    let self = this;
    this._onBlurHandler(self)
  }
  getTrades() {
    const { fund: { pageSize }, dispatch } = this.props;
    const { curIndex, pageNum } = this.state;
    const coinContracts = JSON.parse(sessionStorage.getItem('coinContracts')) || [];
    const userId = decryptByDES(getCookie('token'));
    const data = `userId=${userId}&category=1&pageNum=${pageNum}&pageSize=${pageSize}&coinType=${coinContracts[curIndex].coinType}`;
    dispatch({
      type: 'fund/tradeRecords',
      payload: data
    })
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
        isShowList: false
      })
    }, false);
  }
  handleConfirmWithdraw (tradePassword, mobileVerificationCode, emailVerificationCode ) {
    const { dispatch } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const { curIndex } = this.state;
    const userInfo = JSON.parse(getCookie('userInfo'))
    const userId = decryptByDES(getCookie('token'));
    const amount = this.countRef.current.value;
    const toAddress = this.addressRef.current.value;
    const memo = this.memoRef.current.value;
    const coinId = accountDetails[curIndex].coinType;
    const coinType = accountDetails[curIndex].coinType;
    let data = { amount, coinId, toAddress, tradePassword, userId, mobileVerificationCode, coinType };
    if (parseInt(coinType) === 4) {
      data = { amount, coinId, toAddress, tradePassword, userId, mobileVerificationCode, coinType, memo }
    }
    if (userInfo.emailAuth === 1) {
      if (parseInt(coinType) === 4) {
        data = { amount, coinId, toAddress, tradePassword, userId, mobileVerificationCode, emailVerificationCode, coinType, memo }
      } else {
        data = { amount, coinId, toAddress, tradePassword, userId, mobileVerificationCode, emailVerificationCode, coinType }
      }
    }
    dispatch({
      type: 'fund/accountWithdraw',
      payload: data,
      callback: () => {
        dispatch({
          type: 'fund/showConfirm',
          payload: false
        })
        dispatch({
          type: 'fund/showSuccess',
          payload: true
        })
        this.setState({
          pageNum: 1
        }, () => {
          this.getTrades()
        })
      }
    })
  };
  showList() {
    this.setState({
      isShowList: !this.state.isShowList
    })
  }
  confirm () {
    const { dispatch } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const { curIndex } = this.state;
    const userInfo = JSON.parse(getCookie('userInfo'))
    const userId = decryptByDES(getCookie('token'))
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
    if (!userInfo.mobile) {
      Modal.confirm({
        title: 'Confirm',
        content: `${formatMessage({id: 'notice.binding.phone'})}`,
        okText: `${formatMessage({id: 'confirm'})}`,
        cancelText: `${formatMessage({id: 'cancel'})}`,
        onOk() {
          router.push('/mine');
        },
      });
      return false;
    }
    if (!userInfo.tradePassword) {
      Modal.confirm({
        title: 'Confirm',
        content: `${formatMessage({id: 'notice.assetPwd.setUp'})}`,
        okText: `${formatMessage({id: 'confirm'})}`,
        cancelText: `${formatMessage({id: 'cancel'})}`,
        onOk() {
          dispatch({
            type: 'fund/showFund',
            payload: true
          })
        },
      });
      return false;
    }
    if (!userInfo.front) {
      Modal.confirm({
        title: 'Confirm',
        content: `${formatMessage({id: 'notice.idAuth'})}`,
        okText: `${formatMessage({id: 'confirm'})}`,
        cancelText: `${formatMessage({id: 'cancel'})}`,
        onOk() {
          router.push({
            pathname: '/auth',
          });
        },
      });
      return false;
    }
    if (this.addressRef.current.value === '') {
      showErrorMessage(`${formatMessage({id: 'fund.withdraw.address.input'})}`);
      return false;
    }
    if (parseInt(accountDetails[curIndex].coinType) === 4 && this.memoRef.current.value === '') {
      showErrorMessage(`${formatMessage({id: 'fund.withdraw.memo.input'})}`);
      return false;
    }
    if (numeral(accountDetails[curIndex].amount)._value < numeral(this.countRef.current.value)._value) {
      showErrorMessage(`${formatMessage({id: 'notice.withdraw.upper'})}`);
      return false;
    }
    if (numeral(this.countRef.current.value)._value < accountDetails[curIndex].min) {
      showErrorMessage(`${formatMessage({id: 'notice.withdraw.lower'})}${accountDetails[curIndex].min}`);
      return false;
    }
    if (numeral(this.countRef.current.value)._value > accountDetails[curIndex].max) {
      showErrorMessage(`${formatMessage({id: 'notice.withdraw.upper2'})}${accountDetails[curIndex].max}`);
      return false;
    }
    dispatch({
      type: 'fund/showConfirm',
      payload: true,
      callback: () => {
        this.setState({
          pageNum: 1
        }, () => {
          this.getTrades();
        })
      }
    })
  };
  changeCurIndex(index) {
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    this.setState({
      curIndex: index,
      isShowList: false,
      unit: accountDetails[index].enName,
      pageNum: 1
    }, () => {
      this.getTrades();
    })
  }
  changeCount(event) {
    event.target.value = event.target.value.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
    event.target.value = event.target.value.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    if (event.target.value.indexOf('.') === 0) {
      event.target.value = '0.';
    };
    event.target.value = event.target.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, '$1$2.$3');
    event.target.value = event.target.value.replace('.', '$#$').replace(/\./g,"").replace('$#$', '.');
    if(event.target.value.indexOf('.')< 0 && event.target.value !== ''){ //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      event.target.value= parseFloat(event.target.value);
    }
  }
  changePage(pagination) {
    this.setState({
      pageNum: pagination.current
    }, () => {
      this.getTrades();
    })
  }
  render () {
    const columns = [
      {
        title: `${formatMessage({id: 'fund.withdraw.time'})}`,
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
      },
      {
        title: 'HASH',
        dataIndex: 'transactionId',
        key: 'transactionId',
      },
      {
        title: `${formatMessage({id: 'fund.withdraw.address'})}`,
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: `${formatMessage({id: 'currency'})}`,
        dataIndex: 'coinName',
        key: 'coinName',
      },
      {
        title: `${formatMessage({id: 'count'})}`,
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: `${formatMessage({id: 'fund.withdraw.fee'})}`,
        dataIndex: 'poundage',
        key: 'poundage',
      },
      {
        title: `${formatMessage({id: 'status'})}`,
        dataIndex: 'state',
        key: 'state',
      }

    ];
    const { curIndex, isShowList, unit } = this.state;
    const { fund: { showConfirm, showFund, loading, pagination, tradeRecords } } = this.props;
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
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
            <span>{formatMessage({id: 'withdraw'})}</span>
          </div>
          <ul className={styles.form}>
            <li>
              <label htmlFor="">{formatMessage({id: 'currency'})}</label>
              <div onClick={this.showList.bind(this)} style={{cursor: 'pointer'}}>
                <img src={accountDetails[curIndex] ? accountDetails[curIndex].icon : DefaultIcon} className={styles.types} alt=""/>
                <input type="text" value={accountDetails[curIndex] ? accountDetails[curIndex].enName : 'USDT(OMNI)'} readOnly style={{cursor: 'pointer'}} />
                <img src={BottomIcon} className={styles.icon} alt=""/>
              </div>
              <ul className={styles.list} style={{display: isShowList ? 'block' : 'none'}}>
                {accountItem} 
              </ul>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'fund.withdraw.address'})}</label>
              <div>
                <input type="text" placeholder={formatMessage({id: 'fund.withdraw.address.input'})} ref={this.addressRef} />
              </div>
            </li>
            <li style={{display: accountDetails[curIndex].coinType === 4 ? 'flex' : 'none'}}>
              <label htmlFor="">{formatMessage({id: 'fund.withdraw.memo'})}</label>
              <div>
                <input type="text" placeholder={formatMessage({id: 'fund.withdraw.memo.input'})} ref={this.memoRef} />
              </div>
            </li>
          </ul>
          <p className={styles.notice} style={{display: accountDetails[curIndex].coinType === 4 ? 'flex' : 'none'}}>*{formatMessage({id: 'fund.charge.memo.notice'})}</p>
          <div className={styles.chargeNotice}>
            <span></span>
            <p>{formatMessage({id: 'fund.charge.notice1'})}{unit}{formatMessage({id: 'fund.charge.notice2'})}{unit}{formatMessage({id: 'fund.charge.notice3'})}</p>
          </div>
          <ul className={styles.form}>
            <li>
              <label htmlFor="">{formatMessage({id: 'count'})}</label>
              <div>
                <input type="text" ref={this.countRef} placeholder={`${formatMessage({id: 'input.withdraw.count'})}`} onChange={this.changeCount.bind(this)} />
              </div>
            </li>
            <li>
              <label htmlFor="">{formatMessage({id: 'fund.withdraw.fee'})}</label>
              <div>
                <input type="text" ref={this.feeRef} value={`${accountDetails[curIndex] ? accountDetails[curIndex].poundage : 0}`} readOnly />
              </div>
            </li>
          </ul>
          <p className={styles.notice2}>{formatMessage({id: 'fund.withdraw.available'})}：{accountDetails[curIndex].available}</p>
          <button className={styles.btn} style={{display: accountDetails[curIndex] ? accountDetails[curIndex].withdrawalSwitch === 1 ? 'block' : 'none' : 0}} onClick={() => this.confirm()}>{formatMessage({id: 'confirm'})}</button>
          <button className={styles.btn} style={{display: accountDetails[curIndex] ? accountDetails[curIndex].withdrawalSwitch !== 1 ? 'block' : 'none' : 0, opacity: 0.6, cursor: 'default'}}>{formatMessage({id: 'close'})}</button>
        </div>
        <div className={styles.chargeBottom}>
          <div className={styles.chargeBottomTitle}>{formatMessage({id: 'fund.withdraw.title'})}</div>
          <Table align="center" loading={loading} columns={columns} dataSource={tradeRecords} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
        </div>
        <div style={{display: showConfirm ? 'block' : 'none'}}>
          <ConfirmWithdraw onConfirmWithdraw={this.handleConfirmWithdraw.bind(this)} />
        </div>
        <div style={{display: showFund ? 'block' : 'none'}}>
          <SettingFund  />
        </div>
      </div>
    )
  }
}

Withdraw.defaultProps = {

}
export default connect(({ fund, global }) => ({
  fund, global
}))(Withdraw);