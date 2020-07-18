import React, { Component } from "react";
import styles from './index.less';
import TodayIcon from '@/assets/image/today_niuren.png';
import { formatMessage, getLocale } from 'umi/locale';
import { connect } from 'dva';
import { Table } from 'antd';
import Link from 'umi/link';

class TodayNiuren extends Component {
  constructor (props) {
    super(props);
    this.state = {
      lang: 'zh-CN',
    }
  };
  componentDidMount() {
    const locale = getLocale();
    const { dispatch } = this.props;
    this.setState({
      lang: locale
    });
    // 今日
    dispatch({
      type: 'info/getProfit',
      payload: 1
    })
  };
  render () {
    const { info: { profitListToday } } = this.props;
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
            <img src={TodayIcon} alt=""/>
          </li>
          <li>
            <p>{formatMessage({id: 'index.todayTitle'})}</p>
            <p>{formatMessage({id: 'index.todaySubTitle'})}</p>
          </li>
          <li><Link to="/follow">{formatMessage({id: 'index.more'})}</Link></li>
        </ul>
        <Table rowKey={item => item.rank} size="small" align="center"columns={columns} dataSource={profitListToday} className={styles.table} pagination={false} />
      </div>
    )
  }
}

TodayNiuren.defaultProps = {
  timestamp: 0
}

export default connect(({ info, global }) => ({
  info, global
}))(TodayNiuren);
