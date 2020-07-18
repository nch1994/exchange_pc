import React, { Component, Suspense } from 'react';
import styles from './index.less';
import { Table, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { getCookie, filterPoint, decryptByDES, removeCookie } from '@/utils/utils';
import router from "umi/router";
const FinanceTop = React.lazy(() => import('./financeTop/index'));

class Finance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordIdx: 0,
      recordList: [`${formatMessage({id: 'finance.money.record'})}`, `${formatMessage({id: 'finance.contract.fund.record'})}`, `${formatMessage({id: 'finance.distribution.reward'})}`],
      contractIdx: 0,
      unit: 'USDT',
      contractsList: [],
      totalLoading: true,
    }
  };
  componentDidMount() {
    this.getContractList();
  };
  getContractList() {
    const { dispatch } = this.props;
    const { contractIdx } = this.state;
    dispatch({
      type: 'global/getContracts',
      callback: () => {
        let contractsList = localStorage.getItem('contractsList') ? JSON.parse(localStorage.getItem('contractsList')) : [];
        contractsList = contractsList.filter((element) => {
          return element.contId <= 40;
        })
        this.setState({
          contractsList,
          totalLoading: true,
          unit: contractsList[contractIdx].contName.indexOf('USDT') > -1 ? 'USDT' :  contractsList[contractIdx].contName.split('/')[0]
        })
        let data = 'pageNum=1';
        this.getData(data)
      }
    })
  }
  handleChangeRecordIndex (index) {
    this.setState({
      recordIdx: index
    }, () => {
      const data = 'pageNum=1';
      this.getData(data);
    });
  };
  handleRefresh() {
    let data = 'pageNum=1';
    this.getData(data);
  }
  getData(params) {
    const { dispatch, finance: { pageSize } } = this.props;
    const { contractsList, contractIdx } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }
    const { recordIdx } = this.state;
    if (userId !== '') {
      if (recordIdx === 0) {
        const data = `${params}&userId=${userId}&pageSize=${pageSize}&category=0`
        dispatch({
          type: 'finance/tradeRecords',
          payload: data
        })
      } else if (recordIdx === 1) {
        const data = `${params}&userId=${userId}&state=0&pageSize=${pageSize}&contId=${contractsList[contractIdx].contId}`
        dispatch({
          type: 'finance/getEntrust',
          payload: data,
        })
      } else if (recordIdx === 2) {
        const data = `${userId}?${params}&pageSize=10&contId=${contractsList[contractIdx].contId}`
        dispatch({
          type: 'finance/getRewardList',
          payload: data,
        })
      }
    }
  };
  changePage(pagination) {
    let data = `pageNum=${pagination.current}`;
    this.getData(data);
  }
  onChangeContractIndex (index) {
    const { contractsList } = this.state;
    this.setState({
      contractIdx: index,
      unit: contractsList[index].contName.indexOf('USDT') > -1 ? 'USDT' :  contractsList[index].contName.split('/')[0]
    }, () => {
      const data = 'pageNum=1'
      this.getData(data)
    })
  }
  
  render () {
    const { recordIdx, recordList, contractIdx, unit, contractsList, totalLoading } = this.state;
    const { finance: { loading, pagination, tradeRecords, entrustList, rewardList, rewardAmount, rewardCNY, inviteNum } } = this.props;
    if (contractsList.length < 1) {
      return null;
    }
    const columns1 = [
      {
        title: `${formatMessage({id: 'time'})}`,
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
      },
      {
        title: `${formatMessage({id: 'currency'})}`,
        dataIndex: 'coinName',
        key: 'coinName',
      },
      {
        title: `${formatMessage({id: 'type'})}`,
        dataIndex: 'categoryText',
        key: 'categoryText',
      },
      {
        title: `${formatMessage({id: 'count'})}`,
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: `${formatMessage({id: 'status'})}`,
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: `${formatMessage({id: 'poundage'})}`,
        dataIndex: 'poundage',
        key: 'poundage',
      }
    ];
    const columns2 = [
      {
        title: `${formatMessage({id: 'species'})}`,
        dataIndex: 'contName',
        key: 'contName',
        render: (contName) => {
          return <p>{contName}{formatMessage({id: 'perpetual'})}</p>
        }
      },
      {
        title: `${formatMessage({id: 'time'})}`,
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: `${formatMessage({id: 'type'})}`,
        dataIndex: 'recText',
        key: 'recText',
      },
      {
        title: `${formatMessage({id: 'finance.piece'})}`,
        dataIndex: 'sheet',
        key: 'sheet',
      },
      {
        title: `${formatMessage({id: 'finance.money'})}(${unit})`,
        dataIndex: 'usdtAmount',
        key: 'usdtAmount',
      },
      {
        title: `${formatMessage({id: 'poundage'})}`,
        dataIndex: 'serviceCharge',
        key: 'serviceCharge',
      }
    ];
    const columns3 = [
      {
        title: `${formatMessage({id: 'time'})}`,
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text) => {
          return <span>{text}</span>;
        },
      },
      {
        title: 'ID',
        dataIndex: 'userId',
        key: 'userId'
      },
      {
        title: `${formatMessage({id: 'species'})}`,
        dataIndex: 'recText',
        key: 'recText'
      },
      {
        title: `${formatMessage({id: 'count'})}(${unit})`,
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return <span>{filterPoint(amount, 8)}</span>
        }
      },
      {
        title: `${formatMessage({id: 'finance.convert'})}(CNY)`,
        dataIndex: 'cny',
        key: 'cny',
      }
    ];
    return (
      <Suspense fallback={<Spin spinning={totalLoading} delay={500}></Spin>}>
        <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'record'})}`}>
          <div className={styles.financeWrap}>
            <div className={styles.financeTop}>
              <FinanceTop
                onChangeRecordIndex={this.handleChangeRecordIndex.bind(this)} recordIdx={recordIdx} recordList={recordList}
                onChangeContractIndex={this.onChangeContractIndex.bind(this)} contractIdx={contractIdx} contractsList={contractsList}
                onRefresh={this.handleRefresh.bind(this)}
              />
            </div>
            <div className={styles.FinanceBottom}>
              <div style={{display: recordIdx === 0 ? 'block' : 'none'}}>
                <Table align="center" loading={loading} columns={columns1} dataSource={tradeRecords} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
              </div>
              <div style={{display: recordIdx === 1 ? 'block' : 'none'}}>
                <Table align="center" loading={loading} columns={columns2} dataSource={entrustList} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
              </div>
              <div style={{display: recordIdx === 2 ? 'block' : 'none'}}>
                <ul className={styles.totalList}>
                  <li><p>{formatMessage({id: 'finance.history.combined'})}({unit})</p> <p style={{color: '#FA6A46'}}>{filterPoint(rewardAmount, 8)}</p></li>
                  <li><p>{formatMessage({id: 'finance.history.combined'})}{formatMessage({id: 'finance.convert'})}(CNY)</p> <p style={{color: '#007AFF'}}>{rewardCNY}</p></li>
                  <li><p>{formatMessage({id: 'finance.share.num'})}</p><p style={{color: '#007AFF'}}>{inviteNum}</p></li>
                </ul>
                <Table align="center" loading={loading} columns={columns3} dataSource={rewardList} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
              </div>
            </div>
          </div>
        </DocumentTitle>
      </Suspense>
      
    )
  }
}

export default connect(({ finance, global }) => ({
  finance, global
}))(Finance);