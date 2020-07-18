import React, { Component } from "react";
import styles from './index.less';
import TrendUpIcon from '@/assets/image/trend_up.png';
import TrendDownIcon from '@/assets/image/trend_down.png';
import { formatMessage} from 'umi/locale';
import BTCIcon from '@/assets/image/BTC_icon.png';
import ETHIcon from '@/assets/image/ETH_icon.png';
import ODINIcon from '@/assets/image/ODIN_icon.png';
import rateIcon1 from '@/assets/image/rate1.jpg';
import rateIcon2 from '@/assets/image/rate2.jpg';
import rateIcon3 from '@/assets/image/rate3.jpg';
import AskIcon from '@/assets/image/ask.png';
import { connect } from 'dva';
import router from 'umi/router';
import numeral from 'numeral';
import { Tooltip } from 'antd';
class RateView extends Component {
  componentDidMount() {
  };
  toTrading(contId) {
    sessionStorage.setItem('tradingContId', contId)
    router.push('/trading/1');
  }
  render () {
    let { global: { contractList } } = this.props;
    if (contractList.length <= 1) {
      return null;
    }
    let newContractList = [];
    newContractList[0] = contractList.filter((element) => element.contId === 24)[0];
    newContractList[1] = contractList.filter((element) => element.contId === 21)[0];
    newContractList[2] = contractList.filter((element) => element.contId === 22)[0];
    const RateItem = newContractList.map((item, index) => {
      return<li className={styles.reteItem} key={index} onClick={() => this.toTrading(item.contId)}>
        <div className={styles.itemTop}>
          <p className={styles.itemTopTitle}>
          {
              index === 0
              ? <img src={ODINIcon} alt="" />
              : index === 1
                ? <img src={BTCIcon} alt="" />
                : <img src={ETHIcon} alt="" />
            }
            <Tooltip title={formatMessage({id: 'exponentIntro'})}>
              <span>{item.contName.split('/')[0]}{formatMessage({id: 'exponent'})}</span><img src={AskIcon} className="ask" alt=""/>
            </Tooltip>
          </p>
          <p className={styles.itemTopUSDT}>{item.price}USDT</p>
          <div className={`${styles.trend} ${numeral(item.rate)._value >= 0 ? styles.trendUp : styles.trendDown}`}>
            <img src={numeral(item.rate)._value >= 0 ? TrendUpIcon : TrendDownIcon} alt=""/>
            <span>{item.rate}</span>
          </div>
        </div>
        <div className={styles.itemBottom}>
          {
            index === 0
            ? <img src={rateIcon1} alt="" />
            : index === 1
              ? <img src={rateIcon2} alt="" />
              : <img src={rateIcon3} alt="" />
          }
        </div>
      </li>
    })
    return (
      <ul className={styles.rateList} style={{visibility: contractList.length < 3 ? 'hidden' : 'visible'}}>
        {RateItem}
      </ul>
    );
  }
}
RateView.defaultProps = {
  rateList: []
}

export default connect(({ info, global }) => ({
  info, global
}))(RateView);