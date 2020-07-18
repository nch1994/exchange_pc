import React, { Component } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import CopyIcon from '@/assets/image/fund/copy.png';
import CodeIcon from '@/assets/image/fund/code.png';
import copy from 'copy-to-clipboard';
import { connect } from 'dva';
import { showErrorMessage, showSuccessMessage, getCookie, decryptByDES } from '@/utils/utils';
import { Table } from 'antd';
import Qrcode from '../code/index';
import BottomIcon from '@/assets/image/bottom_black.png';
import DefaultIcon from '@/assets/image/fund/default.png';

class Charge extends Component {
  state = {
    isShowList: false,
    showCode: false,
    curIndex: 0,
    address: '',
    memo: '',
    unit: '',
    pageNum: 1
  };
  copy(value) {
    if (value === '') {
      showErrorMessage(`${formatMessage({id: 'close'})}`)
      return;
    };
    if(copy(value)){
      showSuccessMessage(`${formatMessage({id: 'copySuccess'})}`);
    }else{
      showErrorMessage(`${formatMessage({id: 'copyError'})}`);
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
      unit: accountDetails[index < 0 ? 0 : index].enName
    }, () => {
      this.getTrades();
    })
    this.getAddress(index < 0 ? 0 : index);
    let self = this;
    this._onBlurHandler(self)
  }
  getTrades() {
    const { pageNum } = this.state;
    const { fund: { pageSize }, dispatch } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const { curIndex } = this.state;
    const data = `userId=${userId}&category=2&pageNum=${pageNum}&pageSize=${pageSize}&coinType=${accountDetails[curIndex].coinType}`;
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
  getAddress(index) {
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    const { dispatch } = this.props;
    if (accountDetails[index].depositSwitch === 0) {
      this.setState({
        address: ''
      })
      return;
    }
    const data = {
      coinType: accountDetails[index].coinType,
      userId: decryptByDES(getCookie('token'))
    }
    dispatch({
      type: 'fund/depositAddress',
      payload: data,
      callback: (obj) => {
        this.setState({
          address: obj.address,
          memo: obj.memo
        })
      }
    })
  }
  showCode() {
    const { address } = this.state;
    if (address === '') {
      showErrorMessage(`${formatMessage({id: 'close'})}`)
      return;
    };
    this.setState({
      showCode: true
    })
  }
  handleCloseCode() {
    this.setState({
      showCode: false
    }) 
  };
  changePage(pagination) {
    this.setState({
      pageNum: pagination.current
    }, () => {
      this.getTrades();
    })
  }
  changeCurIndex(index) {
    const accountDetails = JSON.parse(sessionStorage.getItem('accountDetails')) || [];
    this.setState({
      curIndex: index,
      isShowList: false,
      unit: accountDetails[index].enName,
      pageNum: 1
    }, () => {
      this.getTrades();
      this.getAddress(index);
    })
  }
  showList() {
    this.setState({
      isShowList: !this.state.isShowList
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
        title: `${formatMessage({id: 'time'})}`,
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
      },
      {
        title: 'HASH',
        dataIndex: 'transactionId',
        key: 'transactionId',
      },
      {
        title: `${formatMessage({id: 'count'})}`,
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: `${formatMessage({id: 'fund.charge.progress'})}`,
        dataIndex: 'rechargeProgress',
        key: 'rechargeProgress',
      },
      {
        title: `${formatMessage({id: 'status'})}`,
        dataIndex: 'state',
        key: 'state',
      }
    ];
    const { showCode, curIndex, isShowList, address, memo, unit } = this.state;
    const { fund: { pagination, loading, tradeRecords } } = this.props;
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
            <span>{formatMessage({id: 'charge'})}</span>
          </div>
          <div className={styles.chargeNotice}>
            <span></span>
            <p>{formatMessage({id: 'fund.charge.notice1'})}{unit}{formatMessage({id: 'fund.charge.notice2'})}{unit}{formatMessage({id: 'fund.charge.notice3'})}</p>
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
              <label htmlFor="">{formatMessage({id: 'fund.charge.address'})}</label>
              <div>
                <input type="text" value={address || formatMessage({id: 'close'})} readOnly />
                <img src={CopyIcon} className={styles.copy} onClick={this.copy.bind(this, address)} alt=""/>
                <img src={CodeIcon} className={styles.code} onClick={() => this.showCode()} alt=""/>
              </div>
            </li>
            <li style={{display: accountDetails[curIndex].coinType === 4 ? 'flex' : 'none'}}>
              <label htmlFor="">{formatMessage({id: 'fund.charge.memo.title'})}</label>
              <div>
                <input type="text" value={memo || formatMessage({id: 'close'})} readOnly />
                <img src={CopyIcon} className={styles.code} onClick={this.copy.bind(this, memo)} alt=""/>
              </div>
            </li>
          </ul>
          <p className={styles.notice} style={{display: accountDetails[curIndex].coinType === 4 ? 'flex' : 'none'}}>*{formatMessage({id: 'fund.charge.memo.notice'})}</p>
        </div>
        <div className={styles.chargeBottom}>
          <div className={styles.chargeBottomTitle}>{formatMessage({id: 'fund.charge.title'})}</div>
          <Table align="center" loading={loading} columns={columns} dataSource={tradeRecords} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
        </div>
        <div style={{display: showCode ? 'block' : 'none'}}>
          <Qrcode code={address || ''} onCloseCode={() => this.handleCloseCode()} />
        </div>
      </div>
    )
  }
}

Charge.defaultProps = { }
export default connect(({ fund, global }) => ({
  fund, global
}))(Charge);