import React, { Component } from "react";
import NoticeIcon from '@/assets/image/notice.png';
import styles from './index.less';
import { connect } from 'dva';
import Link from 'umi/link';
class NoticeView extends Component {
  state = {
    noticeInfo: {}
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'info/getMessageList',
      payload: '0?pageNum=1&pageSize=10',
      callback: (obj) => {
        this.setState({
          noticeInfo: obj.list[0]
        })
      }
    })
  };
  render () {
    const { noticeInfo } = this.state;
    return (
      <div className={styles.notice}>
        <img src={NoticeIcon} alt="" />
        <Link to="/message" className={styles.message}>{noticeInfo.title}</Link>
      </div>
    )
  }
}
export default connect(({ info, global }) => ({
  info, global
}))(NoticeView);
