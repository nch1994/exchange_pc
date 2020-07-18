import React, { Component } from "react";
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import withRouter from 'umi/withRouter';
import { connect } from 'dva';
import { Modal } from 'antd'
import { decryptByDES, getCookie } from '@/utils/utils';
import router from "umi/router";
const leverList = [10, 20, 50, 75, 100];
class Title extends Component {
  state = {
    showModal: false,
    leverIdx: 0
  }
  componentDidMount() {
    const { trading: { lever } } = this.props;
    const index = leverList.findIndex((item) => {
      return item === lever;
    })
    this.setState({
      leverIdx: index < 0 ? 0 : index
    })
  }
  handleCancel() {
    this.setState({
      showModal: false
    })
  }
  handleOk() {
    const { dispatch, trading: { contractList, curTypeIdx } } = this.props;
    const { leverIdx } = this.state;
    const userId = decryptByDES(getCookie('token')) || ''
    if (userId === '') {
      router.push('/user/login')
    } else {
      dispatch({
        type: 'trading/setLever',
        payload: {
          contId: contractList[curTypeIdx].contId,
          lever: leverList[leverIdx],
          userId: decryptByDES(getCookie('token'))
        }
      })
    }
    this.setState({
      showModal: false
    })
  }
  showLever() {
    const { trading: { lever } } = this.props;
    const index = leverList.findIndex((item) => {
      return item === lever;
    })
    this.setState({
      leverIdx: index < 0 ? 0 : index,
      showModal: true
    })
  }
  changeLeverIdx(index) {
    this.setState({
      leverIdx: index
    })
  }
  render () {
    const { title, trading: { lever } } = this.props;
    const { showModal, leverIdx } = this.state;
    const userId = decryptByDES(getCookie('token')) || ''
    return (
      <div className={styles.title}>
        <div className={styles.title2}>
          <p className={styles.titleText}>{title}{formatMessage({id: "perpetual"})}</p>
          <ul className={styles.intro}>
            <li>
              <p>{formatMessage({id: 'trading.center.account.mode'})}</p>
              <p>{formatMessage({id: 'trading.center.all.warehouse'})}</p>
            </li>
            <li onClick={this.showLever.bind(this)}>
              <p>{formatMessage({id: 'trading.center.leverage'})}</p>
              <p>{lever}X</p>
            </li>
            <li>
              <p>{formatMessage({id: 'trading.center.account.unit'})}: <span>{title.split('/')[1]}</span></p>
              <p>{formatMessage({id: 'trading.center.trade.unit'})}: <span>{formatMessage({id: 'trading.center.piece'})}</span></p>
            </li>
          </ul>
        </div>
        <div>
          <Modal centered={true} title={formatMessage({id: 'trading.center.modify.lever'})} visible={showModal} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)} okText={userId=== '' ? formatMessage({id: 'login'}) : formatMessage({id: 'confirm'})}>
            <ul className={styles.leverItem}>
              {leverList.map((item, index) => {
                return (<li key={index} className={`${index === leverIdx ? styles.active : ''}`} onClick={this.changeLeverIdx.bind(this, index)}>{item}</li>)
              })}
            </ul>
          </Modal>
        </div>
      </div>
    )
  }
}
Title.defaultProps = {
  title: ''
}

export default withRouter(connect(({ trading, global }) => ({
  trading, global
}))(Title));
