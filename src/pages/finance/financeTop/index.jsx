import React, { Component } from 'react';
import styles from './index.less';
// import RefreshIcon from '@/assets/image/finance/refresh.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Select } from 'antd';
const { Option } = Select;

class FinanceTop extends Component {
  state = {
  }
  changeRecordIndex (index) {
    this.props.onChangeRecordIndex(index);
  }
  changeContractIdx (index) {
    this.props.onChangeContractIndex(index);
  };
  refresh() {
    this.props.onRefresh()
  }

  render () {
    const { recordIdx, recordList, contractIdx, contractsList } = this.props;
    const OptionItem = contractsList.map((item, index) => {
      return <Option value={index} key={index}>{ item.contName }{formatMessage({id: 'perpetual'})}</Option>
    })
    return (
      <div className={styles.financeWrap}>
        <div className={styles.financeWrapTop}>
          <ul className={styles.records}>
            {recordList.map((item, index) => {
              return <li key={index} className={`${recordIdx === index ? styles.active : ''}`} onClick={() => this.changeRecordIndex(index)}>{item}</li>
            })}
          </ul>
          <Select defaultValue={contractsList[contractIdx].contName + formatMessage({id: 'perpetual'})} size="large" style={{ display: recordIdx !== 0 ? 'flex' : 'none' }} onChange={(e)=>this.changeContractIdx(e)}>
            {OptionItem}
          </Select>
          {/* <button className={styles.btn} onClick={() => this.refresh()}>
            <img src={RefreshIcon} alt=""/>
            <span>{formatMessage({id: 'finance.refresh'})}</span>
          </button> */}
        </div>
      </div>
    )
  }
}
FinanceTop.defaultProps = {
  recordIdx: 0,
  contractIdx: 0,
  recordList: [],
};

export default connect(({ finance, global }) => ({
  finance, global
}))(FinanceTop);
