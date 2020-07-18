import React, { Component } from "react";
import styles from './index.less';
import HistoryIcon from '@/assets/image/history_niuren.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Table } from 'antd';

class HistoryNiuren extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'info/getProfit',
      payload: '0'
    })
  }
  render () {
    const { info: { profitListHistory } } = this.props;
    const columns = [
      {
        title: `${formatMessage({id: 'index.table.rank'})}`,
        dataIndex: 'rank',
        key: 'rank',
        render: (rank) => {
          return <span className={styles.rank}>{rank}</span>
        }
      },
      {
        title: `${formatMessage({id: 'user'})}`,
        dataIndex: 'mobile',
        key: 'mobile'
      },
      {
        title: `${formatMessage({id: 'fund.contractType'})}`,
        dataIndex: 'contName',
        key: 'contName'
      },
      {
        title: `${formatMessage({id: 'index.table.closing.yield'})}`,
        dataIndex: 'rate',
        key: 'rate',
        render: (rate) => {
          return <span className={styles.rate}>{rate}</span>
        }
      },
      {
        title: `${formatMessage({id: 'index.table.holding.cycle'})}`,
        dataIndex: 'cycle',
        key: 'cycle',
      }
    ];
    return (
      <div className={styles.todayNiuren}>
        <ul className={styles.title}>
          <li>
            <img src={HistoryIcon} alt=""/>
          </li>
          <li>
            <p>{formatMessage({id: 'index.historyTitle'})}</p>
            <p>{formatMessage({id: 'index.historySubTitle'})}</p>
          </li>
        </ul>
        <Table rowKey={item => item.rank} size="small" columns={columns} dataSource={profitListHistory} className={styles.table} pagination={false} />
      </div>
    )
  }
}

HistoryNiuren.defaultProps = {

}
export default connect(({ info, global }) => ({
  info, global
}))(HistoryNiuren);
