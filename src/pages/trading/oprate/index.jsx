import React, { Component, createRef } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import numeral from 'numeral';
import { showErrorMessage, getCookie, filterPoint, filterDigit, filterInputDigit, decryptByDES } from '@/utils/utils';
import router from 'umi/router';
import { Tooltip } from 'antd';

class Oprate extends Component {
  constructor(props) {
    super(props);
    this.limitRef = createRef();
    this.countVal = createRef();
    this.percentList = ['25%', '50%', '75%', '100%'];
  };
  state={
    disabled: false,
    show: false,
    title1: `${formatMessage({id: 'trading.market.price.notice'})}`,
    title2: `${formatMessage({id: 'trading.rival.price.notice'})}`,
    readonly: false
  }
  componentDidMount() {
    this.limitRef.current.value = '';
    this.countVal.current.value = '';
  }
  componentDidUpdate(prevProps) {
    if (prevProps.trading.contId !== this.props.trading.contId) {
      this.countVal.current.value = '';
      this.limitRef.current.value = ''
    }
  }
  changeIdx (types, index) {
    const { dispatch, trading, trading: { oprateIdx, myAsset, flatEmpty, flatMore } } = this.props;
    switch (types) {
      case 'oprateIdx':
        dispatch({
          type: "trading/changeIndex",
          payload: {
            ...trading,
            oprateIdx: index,
            percentIdx: -1
          },
        });
        this.countVal.current.value = ''
        break
      case 'priceIdx': 
        dispatch({
          type: "trading/changeIndex",
          payload: {
            ...trading,
            priceIdx: index,
            percentIdx: -1
          },
        });
        if (index === 1) {
          this.setState({
            show: true
          })
          setTimeout(() => {
            this.setState({
              show: false
            })
          }, 1500)
        }
        break;
      case 'percentIdx':
        dispatch({
          type: "trading/changeIndex",
          payload: {
            ...trading,
            percentIdx: index,
          },
        });
        const maxFlat = Math.max(flatEmpty, flatMore);
        this.countVal.current.value = oprateIdx === 0 ? parseInt(numeral(myAsset.size)._value * numeral(this.percentList[index])._value) : parseInt(numeral(maxFlat)._value * numeral(this.percentList[index])._value);
        break;
      default:
        break
    }
  };
  login() {
    router.push('/user/login');
  }
  entrust (type) {
    const limitRef = numeral(this.limitRef.current.value).value();
    const countVal = numeral(this.countVal.current.value).value();
    const { trading: { priceIdx, myAsset, oprateIdx, flatMore, flatEmpty } } = this.props;
    const { readonly } = this.state
    if (limitRef <= 0 && priceIdx === 0 && !readonly) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.limit.notice'})}`);
      return false;
    }
    if (countVal <= 0) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.count.notice'})}`);
      return false;
    }
    if (oprateIdx === 0 && countVal > numeral(myAsset.size).value()) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.can.open.notice'})}`);
      return false;
    }
    if (type === 11 && oprateIdx === 1 && countVal > numeral(flatMore).value()) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.can.flat.notice'})}`);
      return false;
    }
    if (type === 10 && oprateIdx === 1 && countVal > numeral(flatEmpty).value()) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.can.flat.notice'})}`);
      return false;
    }
    let average = this.limitRef.current.value;
    if(priceIdx === 1) {
      average = '';
    } else if (priceIdx === 0 && readonly) {
      average = '';
    }
    this.props.onEntrust(average, countVal, type, true);
  };
  changeReadOnly() {
    const { readonly } = this.state;
    this.setState({
      readonly: !readonly
    })
  }
  changeLimit(event) {
    const { trading: { curTypeIdx }, contractList, dispatch } = this.props;
    event.target.value = event.target.value.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
    event.target.value = event.target.value.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    if (event.target.value.indexOf('.') === 0) {
      event.target.value = '0.';
    };
    event.target.value = event.target.value.replace(filterInputDigit(contractList[curTypeIdx].contName), '$1$2.$3');
    event.target.value = event.target.value.replace('.', '$#$').replace(/\./g,"").replace('$#$', '.');
    if(event.target.value.indexOf('.')< 0 && event.target.value !== ''){ //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      event.target.value= parseFloat(event.target.value);
    }
    dispatch({
      type: 'trading/setLimitPrice',
      payload: event.target.value
    })
  }
  changeCount(event) {
    event.target.value = event.target.value.replace(/\D/g,'');
  }
  render () {
    const oprateList = [`${formatMessage({id: 'trading.center.open.positions'})}`, `${formatMessage({id: 'trading.center.unwind'})}`];
    const priceList = [`${formatMessage({id: 'limit'})}`, `${formatMessage({id: 'market'})}`];
    const { trading: { curTypeIdx, oprateIdx, priceIdx, percentIdx, myAsset, flatMore, flatEmpty, limitPrice, contractList }  } = this.props;
    const { title1, title2, show, readonly } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';
    let depthPrice = contractList[curTypeIdx].price || '';
    const countVal = this.countVal.current ? numeral(this.countVal.current.value).value() : 0;
    if (limitPrice !== '') {
      this.limitRef.current.value = limitPrice;
    }
    depthPrice = filterPoint(depthPrice, filterDigit(contractList[curTypeIdx].contName))
    if (readonly) {
      this.limitRef.current.value = depthPrice;
    }
    const unit = contractList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : 'USD';
    const amountNoticeUnit = contractList[curTypeIdx].contName.indexOf('USDT') > -1 ? contractList[curTypeIdx].contName.split('/')[0] : 'USD';
    const unit2 = contractList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : contractList[curTypeIdx].contName.indexOf('(') > -1 ? contractList[curTypeIdx].contName.match(/\((\S*)\)/)[1] : contractList[curTypeIdx].contName.split('/')[0];
    const amountNotice = `${formatMessage({id: 'unitPrice'})}：${contractList[curTypeIdx].sheetValue}${amountNoticeUnit}/${formatMessage({id: 'trading.center.piece'})}`;
    return (
      <div className={styles.oprate}>
        <ul className={styles.title}>
          {oprateList.map((item, index) => {
            return <li key={index} className={oprateIdx === index ? styles.active : ''} onClick={() => this.changeIdx('oprateIdx', index)}>{item}</li>
          })}
        </ul>
        <div className={styles.content}>
          <div className={styles.price}>
            {priceList.map((item, index) => {
              return <button key={index} className={priceIdx === index ? styles.active : ''} onClick={() => this.changeIdx('priceIdx', index)}>{item}</button>
            })}
          </div>
          <div className={styles.form} >
            <p className={styles.toast} style={{display: show ? 'block' : 'none'}}>{title1}</p>
            <div className={`${styles.item} ${styles.myPrice}`} style={{display: priceIdx === 0 ? 'flex' : 'none'}}>
              <div style={{backgroundColor: readonly ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}}>
                <label htmlFor="" >{formatMessage({id: 'price'})}</label>
                <input type="text" ref={this.limitRef} onChange={this.changeLimit.bind(this)} readOnly={readonly} />
                <span>{unit}</span>
              </div>
              <Tooltip title={title2}>
                <button className={`${styles.btn} ${styles.hoverBtn}`} onClick={() => this.changeReadOnly()}>{formatMessage({id: 'trading.center.competitors'})}</button>
              </Tooltip>
            </div>
            <div className={`${styles.item} ${styles.marketPrice}`} style={{display: priceIdx === 1 ? 'flex' : 'none'}}>
              <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
                <label htmlFor="">{formatMessage({id: 'price'})}</label>
                <input type="text" readOnly value={depthPrice || '--'} />
                <span>{unit}</span>
              </div>
            </div>
            <div className={`${styles.item} ${styles.count}`}>
              <div>
                <label htmlFor="">{formatMessage({id: 'count'})}</label>
                <input className={styles.oprateInput} type="text" ref={this.countVal} onChange={this.changeCount.bind(this)} placeholder={amountNotice}  />
                <span>{formatMessage({id: 'trading.center.piece'})}</span>
              </div>
            </div>
          </div>
          <ul className={styles.percent}>
            {this.percentList.map((item, index) => {
              return <li key={index} className={percentIdx === index ? styles.active : ''} onClick={() => this.changeIdx('percentIdx', index)}>{item}</li>
            })}
          </ul>
          <div className={styles.available}>
            <p style={{display: oprateIdx === 0 ? 'block' : 'none'}}>{formatMessage({id: 'trading.center.available.margin'})}：{myAsset.usable || 0} {unit2}</p>
            <p style={{display: oprateIdx === 0 ? 'block' : 'none'}}>{formatMessage({id: 'trading.center.can.open'})}：{myAsset.size || 0 } {formatMessage({id: 'trading.center.piece'})}</p>
            <p style={{display: oprateIdx === 1 ? 'block' : 'none'}}>{formatMessage({id: 'trading.center.can.flatMore'})}：{ flatMore } {formatMessage({id: 'trading.center.piece'})}</p>
            <p style={{display: oprateIdx === 1 ? 'block' : 'none'}}>{formatMessage({id: 'trading.center.can.flatEmpty'})}：{ flatEmpty } {formatMessage({id: 'trading.center.piece'})}</p>
          </div>
          <ul className={styles.buttonWrap} style={{display: oprateIdx === 0 ? 'flex' : 'none'}}>
            <li>
              {
                userId === ''
                ? <button onClick={() => this.login()}>{formatMessage({id: 'login'})}</button>
                : contractList[curTypeIdx].contSwitch === 0
                  ? <button disabled>{formatMessage({id: 'close'})}</button>
                  : <button onClick={() => this.entrust(1)}>{formatMessage({id: 'trading.center.buy'})} <span>{formatMessage({id: 'trading.center.rise'})}</span></button>
              }
            </li>
            <li>
              {
                userId === ''
                  ? <button onClick={() => this.login()}>{formatMessage({id: 'login'})}</button>
                  : contractList[curTypeIdx].contSwitch === 0
                    ? <button disabled>{formatMessage({id: 'close'})}</button>
                    : <button onClick={() => this.entrust(0)}>{formatMessage({id: 'trading.center.sale'})} <span>{formatMessage({id: 'trading.center.fall'})}</span></button>
              }
            </li>
          </ul>
          <ul className={styles.buttonWrap} style={{display: oprateIdx === 1 ? 'flex' : 'none'}}>

            <li>
              {
                userId === ''
                  ? <button onClick={() => this.login()}>{formatMessage({id: 'login'})}</button>
                  : contractList[curTypeIdx].contSwitch === 0
                    ? <button disabled>{formatMessage({id: 'close'})}</button>
                    : <button disabled={countVal > flatEmpty} onClick={() => this.entrust(10)}>{formatMessage({id: 'trading.center.buyFlat'})} <span>{formatMessage({id: 'trading.center.rise'})}</span></button>
              }
            </li>

            <li>
              {
                userId === '' 
                  ? <button onClick={() => this.login()}>{formatMessage({id: 'login'})}</button>
                  : contractList[curTypeIdx].contSwitch === 0 
                    ? <button disabled>{formatMessage({id: 'close'})}</button>
                    : <button disabled={countVal > flatMore} onClick={() => this.entrust(11)}>{formatMessage({id: 'trading.center.saleFlat'})} <span>{formatMessage({id: 'trading.center.fall'})}</span></button>
              }
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
Oprate.defaultProps = { }
export default connect(({ trading, global }) => ({
  trading, global
}))(Oprate);