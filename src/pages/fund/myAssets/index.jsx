import styles from './index.less';
import React, { Component } from 'react';
import EyeOpenIcon from '@/assets/image/fund/eye_open.png';
import EyeCloseIcon from '@/assets/image/fund/eye_close.png';
import HuazhuanIcon from '@/assets/image/fund/huazhuan.png';
import PingcangIcon from '@/assets/image/fund/pingcang.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import Link from 'umi/link';
import { Select } from 'antd';
import router from 'umi/router';
const { Option } = Select;

class MyAssets extends Component {
  constructor (props) {
    super(props);
    const { fund: { contractAccounts } } = props
    this.state = {
      isShow: true,
      curIndex: 0,
      unit: contractAccounts[0].contName.indexOf('USDT') > -1 ? 'USDT' : contractAccounts[0].contName.split('/')[0]
    }
  };
  eye () {
    const { isShow } = this.state;
    this.setState({
      isShow: !isShow
    })
  };
  changeMenu () {
    router.push({
      pathname: '/fund/transfer'
    })
  };
  changeContractIdx(index) {
    const { fund: { contractAccounts } } = this.props;
    this.setState({
      curIndex: index,
      unit: contractAccounts[index].contName.indexOf('USDT') > -1 ? 'USDT' : contractAccounts[index].contName.split('/')[0]
    })
  }
  chooseAccount (index, contId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'fund/changeCurrentIdx',
      payload: index
    })
  };
  render () {
    const { isShow, curIndex, unit } = this.state;
    const { fund: { contractAccounts } } = this.props;
    const OptionItem = contractAccounts.map((item, index) => {
      return <Option value={index} key={index}>{ item.contName }{formatMessage({id: 'perpetual'})}</Option>
    })
    return (
      <div className={styles.fundWrap}>
        <div className={styles.fundWrapInner}>
          <div className={styles.title}>
            <p>{formatMessage({id: 'fund.myAssets'})}</p>
            {isShow ? <img src={EyeOpenIcon} alt="" onClick={this.eye.bind(this)} /> : <img src={EyeCloseIcon} alt="" onClick={this.eye.bind(this)} />}
          </div>
          <div>
            <div className={styles.account}>
              <p>{formatMessage({id: 'fund.myAssets.current.account'})}</p>
              <Select defaultValue={contractAccounts[curIndex].contName + formatMessage({id: 'perpetual'})} dropdownClassName={styles.dropdown} style={{ width: 180, }} onChange={(e)=>this.changeContractIdx(e)}>
                {OptionItem}
              </Select>
            </div>
          </div>
          <ul>
            <li>
              <p>{formatMessage({id: 'fund.myAssets.account.rights'})}({unit}):</p>
              <p>{isShow ? contractAccounts[curIndex] ? contractAccounts[curIndex].balance : 0 : '****'}({unit})</p>
            </li>
            <li>
              <p>{formatMessage({id: 'fund.myAssets.frozen.deposit'})}({unit}):</p>
              <p>{isShow ? contractAccounts[curIndex] ? contractAccounts[curIndex].freeze : 0 : '****'}({unit})</p>
            </li>
            <li>
              <p>{formatMessage({id: 'fund.myAssets.position.margin'})}({unit}):</p>
              <p>{isShow ? contractAccounts[curIndex] ? contractAccounts[curIndex].bond : 0 : '****'}({unit})</p>
            </li>
            <li>
              <p>{formatMessage({id: 'fund.myAssets.realized'})}({unit}):</p>
              <p>{isShow ? contractAccounts[curIndex] ? contractAccounts[curIndex].settle : 0 : '****'}({unit})</p>
            </li>
            <li>
              <p>{formatMessage({id: 'fund.myAssets.unrealized'})}({unit}):</p>
              <p>{isShow ? contractAccounts[curIndex] ? contractAccounts[curIndex].profit : 0 : '****'}({unit})</p>
            </li>
            <li>
              <p>{formatMessage({id: 'fund.myAssets.margin.rate'})}:</p>
              <p>{isShow ? contractAccounts[curIndex] ? contractAccounts[curIndex].bondRate : '0%' : '****'}</p>
            </li>
            <li></li>
          </ul>
          <div className={styles.btnWrap}>
            <button className={styles.btn} onClick={this.changeMenu.bind(this)}>
              <img src={HuazhuanIcon} alt=""/>
              {formatMessage({id: 'transfer'})}
            </button>
            <Link to='/trading' className={styles.btn}>
              <img src={PingcangIcon} alt=""/>
              {formatMessage({id: 'unwind'})}
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

MyAssets.defaultProps = {
};

export default connect(({ fund, global }) => ({
  fund, global
}))(MyAssets);