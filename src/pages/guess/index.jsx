import styles from './index.less';
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import DocumentTitle from 'react-document-title';
import withRouter from 'umi/withRouter';
import optionIcon01 from '@/assets/image/optionIcon01.png';
import optionIcon02 from '@/assets/image/optionIcon02.png';
import SoptionIcon01 from '@/assets/image/soptionIcon01.png';
import SoptionIcon02 from '@/assets/image/soptionIcon02.png';
import AskIcon from '@/assets/image/ask.png';
import Oprate from './oprate/index'
import CountDown from './countDown'
import AreaChart from './areaChart'
import KlineChart from './klineChart'
import { Table, Tooltip } from 'antd';
import { decryptByDES, getCookie } from '@/utils/utils';
import moment from 'moment'
let timer3 = null;
class Guess extends Component {
  state = {
    curIndex: 0,
    cycleIdx: 0,
    cycleList: [{
      cycle: 1,
      eth: 0.1,
      usdt: 10
    }, {
      cycle: 3,
      eth: 0.5,
      usdt: 50
    }, {
      cycle: 5,
      eth: 1,
      usdt: 100
    }],
    ratio: 10,
    maxSheet: 0,
    pageNum: 1,
    chartIdx: 0,
    addTime1: '--',
    addTime2: '--',
    addTime3: '--',
    optionIdx: 0
  }
  componentDidMount() {
    const { dispatch } = this.props;
    const { cycleList, cycleIdx } = this.state;
    this.setState({
      addTime1: moment().add(1, 'minutes').format('HH:mm'),
      addTime2: moment().add(cycleList[cycleIdx].cycle + 1, 'minutes').format('HH:mm'),
      addTime3: moment().add(cycleList[cycleIdx].cycle, 'minutes').format('HH:mm'),
    })
    dispatch({
      type: 'guess/getOptions',
      callback: () => {
        if (timer3) { clearInterval(timer3) }
        this.getAccount();
        this.getRecord();
      }
    })
  }
  componentWillUnmount() {
    if (timer3) clearInterval(timer3);
  }
  getAccount() {
    const { dispatch, guess: { optionList } } = this.props;
    const { cycleList, cycleIdx, optionIdx } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') return;
    if (timer3) { clearInterval(timer3) }
    dispatch({
      type: 'guess/guessAccount',
      payload: `${userId}/${optionList[optionIdx].contId}`,
      callback: (obj2) => {
        const sheetValue = optionList[optionIdx].coinName === 'USDT' ? cycleList[cycleIdx].usdt : cycleList[cycleIdx].eth;
        const maxSheet = Math.floor(obj2.balance / (parseFloat(sheetValue) * (1 + optionList[optionIdx].serviceCharge)));
        this.setState({
          maxSheet: maxSheet > 10 ? 10 : maxSheet,
          addTime1: moment(new Date(obj2.timestamp)).add(1, 'minutes').format('HH:mm'),
          addTime2: moment(new Date(obj2.timestamp)).add(cycleList[cycleIdx].cycle + 1, 'minutes').format('HH:mm'),
          addTime3: moment(new Date(obj2.timestamp)).add(cycleList[cycleIdx].cycle, 'minutes').format('HH:mm'),
        })
        let timestamp = obj2.timestamp;
        timer3 = setInterval(() => {
          let { curIndex } = this.state;
          timestamp = timestamp + 1000;
          const currentSeconds = new Date(timestamp).getSeconds();
          if (currentSeconds === 2) {
            this.setState({
              addTime1: moment(new Date(timestamp)).add(1, 'minutes').format('HH:mm'),
              addTime2: moment(new Date(timestamp)).add(cycleList[cycleIdx].cycle + 1, 'minutes').format('HH:mm'),
              addTime3: moment(new Date(timestamp)).add(cycleList[cycleIdx].cycle, 'minutes').format('HH:mm')
            })
            if (curIndex === 0 ) {
              if (timer3) { clearInterval(timer3) }
              this.getAccount();
              this.getRecord();
            }
          }
        }, 1000)
      }
    })
  }
  getRecord() {
    const { dispatch, guess: { optionList } } = this.props;
    const { curIndex, pageNum, optionIdx } = this.state;
    const types = curIndex === 0 ? 1 : 2;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') return;
    if (curIndex === 0) {
      dispatch({
        type: 'guess/changeCurrentRecords',
        payload: []
      })
    }
    dispatch({
      type: 'guess/guessRecord',
      payload: `guessId=${optionList[optionIdx].contId}&types=${types}&userId=${userId}&pageNum=${pageNum}&pageSize=10`
    })
  }
  changeIdx(index) {
    this.setState({
      curIndex: index
    }, () => {
      this.getAccount()
      this.getRecord();
    })
  }
  handleEntrust(recType, sheet) {
    const { dispatch, guess: { optionList } } = this.props;
    const { cycleList, cycleIdx, ratio, optionIdx } = this.state;
    const data = {
      userId: decryptByDES(getCookie('token')) || '',
      guessId: optionList[optionIdx].contId,
      cycle: cycleList[cycleIdx].cycle,
      recType,
      sheet,
      ratio
    }
    dispatch({
      type: 'guess/addEntrust',
      payload: data,
      callback: () => {
        dispatch({
          type: 'guess/currentRecords',
          payload: {
            currentRecords: []
          }
        })
        if (timer3) { clearInterval(timer3) }
        this.getAccount();
        this.getRecord();
      }
    })
  }
  changeChartIdx(index) {
    this.setState({
      chartIdx: index
    })
  }
  changeOptionIdx(index) {
    this.setState({
      optionIdx: index
    }, () => {
      if (timer3) { clearInterval(timer3) }
      this.getAccount();
      this.getRecord();
    })
  }
  changeCycleIdx(index) {
    const { cycleList } = this.state;
    this.setState({
      cycleIdx: index,
      addTime1: moment().add(1, 'minutes').format('HH:mm'),
      addTime2: moment().add(cycleList[index].cycle + 1, 'minutes').format('HH:mm'),
      addTime3: moment().add(cycleList[index].cycle, 'minutes').format('HH:mm'),
    }, () =>{
      this.getAccount();
    })
  }
  changePage(pagination) {
    this.setState({
      pageNum: pagination.current
    }, () => {
      this.getRecord()
    })
  }
  render() {
    const { guess: { pagination, currentRecords, historyRecords, optionList } } = this.props;
    const { curIndex, maxSheet, chartIdx, cycleList, cycleIdx, addTime1, addTime2, addTime3, optionIdx } = this.state;
    const list = [`${formatMessage({id: 'guess.position.current'})}`, `${formatMessage({id: 'guess.position.history'})}`];
    if (optionList.length < 1) {
      return null
    }
    const columns1 = [
      {
        title: `${formatMessage({id: 'guess.table.name'})}`,
        dataIndex: 'guessName',
        key: 'guessName',
      },
      {
        title: `${formatMessage({id: 'guess.table.time'})}`,
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: `${formatMessage({id: 'guess.table.direction'})}`,
        dataIndex: 'recType',
        key: 'recType',
        render: (recType) => {
        return <span>{recType === 1 ? formatMessage({id: 'trading.center.rise'}) : formatMessage({id: 'trading.center.fall'})}</span>
        }
      },
      {
        title: `${formatMessage({id: 'guess.table.cycle'})}`,
        dataIndex: 'cycle',
        key: 'cycle',
        render: (cycle) => {
          return (<span>{cycle}min</span>)
        }
      },
      {
        title: <div>{formatMessage({id: 'guess.table.price'})}(USD)<Tooltip title={formatMessage({id: 'guess.table.price.tooltip'})}><img src={AskIcon} className={styles.ask} alt=""/></Tooltip></div>,
        dataIndex: 'openPrice',
        key: 'openPrice',
      },
      {
        title: `${formatMessage({id: 'guess.table.sheet'})}(${formatMessage({id: 'guess.form.unit'})})`,
        dataIndex: 'sheet',
        key: 'sheet',
      },
      {
        title: `${formatMessage({id: 'guess.table.expectRate'})}`,
        dataIndex: 'ratio',
        key: 'ratio',
        render: (ratio) => {
          return (<span>{ratio}%</span>)
        }
      },
      {
        title: `${formatMessage({id: 'guess.table.endTime'})}`,
        dataIndex: 'settleTime',
        key: 'settleTime',
      },
      {
        title: `${formatMessage({id: 'guess.table.flat'})}`,
        dataIndex: 'countDown',
        key: 'countDown',
        render: (countDown) => {
          return (<CountDown target={countDown} /> )
        }
      }
    ];
    const columns2 = [
      {
        title: `${formatMessage({id: 'guess.table.name'})}`,
        dataIndex: 'guessName',
        key: 'guessName',
      },
      {
        title: `${formatMessage({id: 'guess.table.dealTime'})}`,
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: `${formatMessage({id: 'guess.table.cutOffTime'})}`,
        dataIndex: 'settleTime',
        key: 'settleTime',
      },
      {
        title: `${formatMessage({id: 'guess.table.direction'})}`,
        dataIndex: 'recType',
        key: 'recType',
        render: (recType) => {
          return <span>{recType === 1 ? formatMessage({id: 'trading.center.rise'}) : formatMessage({id: 'trading.center.fall'})}</span>
        }
      },
      {
        title: <div>{formatMessage({id: 'guess.table.price'})}(USD)<Tooltip title={formatMessage({id: 'guess.table.price.tooltip'})}><img src={AskIcon} className={styles.ask} alt=""/></Tooltip></div>,
        dataIndex: 'openPrice',
        key: 'openPrice',
      },
      {
        title: <div>{formatMessage({id: 'guess.table.curOffPrice'})}(USD)<Tooltip title={formatMessage({id: 'guess.table.curOffPrice.tooltip'})}><img src={AskIcon} className={styles.ask} alt=""/></Tooltip></div>,
        dataIndex: 'closePrice',
        key: 'closePrice',
      },
      {
        title: `${formatMessage({id: 'guess.table.flatSheet'})}(${formatMessage({id: 'guess.form.unit'})})`,
        dataIndex: 'sheet',
        key: 'sheet',
      },
      {
        title: `${formatMessage({id: 'guess.table.rate'})}`,
        dataIndex: 'ratio',
        key: 'ratio',
        render: (ratio) => {
          return (<span>{ratio}%</span>)
        }
      },
      {
        title: `${formatMessage({id: 'guess.table.option.output'})}(${optionList[optionIdx].coinName})`,
        dataIndex: 'profit',
        key: 'profit',
      },
      {
        title: `${formatMessage({id: 'guess.table.poundage'})}(${optionList[optionIdx].coinName})`,
        dataIndex: 'services',
        key: 'services',
      }
    ]
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'guess.subTitle'})}`}>
        <div className={styles.guessWrap}>
          <div className={styles.guessInner}>
            <div className={styles.guessTop}>
              <div className={styles.currentOption}>
                <img src={optionList[optionIdx].icon} alt="" />
                <div><span>{optionList[optionIdx].contName}</span><span>{formatMessage({id: 'guess.subTitle'})}</span></div>
              </div>
              <div className={styles.cycleItemWrap}>
                <ul className={styles.cycleItem}>
                  {optionList.map((item, index) => {
                    return (<li key={index} className={`${optionIdx === index ? styles.active : ''}`} onClick={this.changeOptionIdx.bind(this, index)}>{item.coinName}</li>)
                  })}
                </ul>
                <ul className={styles.cycleItem}>
                  {cycleList.map((item, index) => {
                    return (<li key={index} className={`${cycleIdx === index ? styles.active : ''}`} onClick={this.changeCycleIdx.bind(this, index)}>{item.cycle}min</li>)
                  })}
                </ul>
              </div>
              <ul className={styles.navIcons}>
                <li><img src={chartIdx === 0 ? SoptionIcon01 : optionIcon01} onClick={this.changeChartIdx.bind(this, 0)} alt=""/></li>
                <li><img src={chartIdx === 1 ? SoptionIcon02 : optionIcon02} onClick={this.changeChartIdx.bind(this, 1)} alt=""/></li>
              </ul>
            </div>
            <div className={styles.guessCenter}>
              <div className={styles.centerLeft}>
                {
                  chartIdx === 0
                  ? <AreaChart id={optionList[optionIdx].okex} />
                  : <KlineChart id={optionList[optionIdx].okex} />
                }
              </div>
              <div className={styles.centerRight}>
                <Oprate cycleList={cycleList} cycleIdx={cycleIdx} onEntrust={this.handleEntrust.bind(this)} maxSheet={maxSheet} optionIdx={optionIdx} addTime1={addTime1} addTime2={addTime2} addTime3={addTime3} />
              </div>
            </div>
            <ul className={styles.listTitle}>
              {list.map((item, index) => {
                return <li key={index} className={curIndex === index ? styles.active : ''} onClick={this.changeIdx.bind(this, index)}>
                  <span className={styles.text}>{item}</span>
                  <span className={styles.line}></span>
                </li>
              })}
            </ul>
            <div className={styles.table}>
              <Table align="center" rowKey={item => item.accId} columns={curIndex === 0 ? columns1 : columns2} dataSource={curIndex === 0 ? currentRecords : historyRecords} pagination={pagination} onChange={this.changePage.bind(this)} />
            </div>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default withRouter(connect(({ guess, global }) => ({
  guess, global
}))(Guess));

