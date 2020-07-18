import styles from './index.less';
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import DocumentTitle from 'react-document-title';
import { Table } from 'antd';
import withRouter from 'umi/withRouter';
import { getCookie, decryptByDES, removeCookie } from '@/utils/utils';
import bottomIcon from '@/assets/image/message_bottom.png';
import topIcon from '@/assets/image/message_top.png';
import router from "umi/router";

class Message extends Component {
  state = {
    messageList: [],
    pagination: {}
  }
  componentDidMount() {
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId !== '') {
      this.getMessageList(1)
    } else {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }
  }
  getMessageList(pageNum) {
    const { dispatch, message: { pageSize } } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    dispatch({
      type: 'message/getMessageList',
      payload: `${userId}?pageNum=${pageNum}&pageSize=${pageSize}`,
      callback: (obj) => {
        obj.list.forEach((element, index) => {
          element.index = index;
          element.serial = {
            read: element.read,
            index: index + 1
          };
          element.info = {
            content: element.content,
            isShow: false,
            index: index
          }
        })
        this.setState({
          messageList: obj.list,
          pagination: {
            total: obj.total,
            current: obj.prePage + 1
          }
        })
      }
    })
  }
  changeIsShow(index) {
    let { messageList } = this.state;
    messageList[index].info = {
      isShow: true,
      index: index,
      content: messageList[index].content
    }
    this.setState({
      messageList: messageList
    })
  }
  changeIsShow2(index) {
    let { messageList } = this.state;
    messageList[index].info = {
      isShow: false,
      index: index,
      content: messageList[index].content
    }
    this.setState({
      messageList: messageList
    })
  }
  changePage(pagination) {
    this.getMessageList(pagination.current);
  }

  addRead(noticeId, read, index) {
    if (read === 1) {
      return;
    }
    const { dispatch } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      removeCookie('userInfo');
      removeCookie('token');
      router.replace('/')
    }

    dispatch({
      type: 'message/addRead',
      payload: `${userId}/${noticeId}`,
      callback: () => {
        const { messageList } = this.state;
        const { global: { unReadCount } } = this.props;
        messageList[index].serial = {
          read: 1,
          index: index + 1
        }
        const unReadCountNew = parseInt(unReadCount - 1) < 0 ? 0 : parseInt(unReadCount - 1);
        this.setState({
          unReadCount: unReadCountNew,
          messageList: messageList
        })
        if (parseInt(unReadCountNew) === 0) {
          dispatch({
            type: 'global/setUnRead',
            payload: 0
          })
        }
      }
    })
  }
  
  render() {
    const { messageList, pagination } = this.state;
    const column = [{
      title: `${formatMessage({id: 'message.table.number'})}`,
      dataIndex: 'serial',
      key: 'serial',
      render: (serial) => {
        return <p className={`${styles.isRead} ${serial.read === 1 ? styles.hasRead : styles.notRead}`}>
          <span className={styles.point} />
          <span>{serial.read ===1 ? formatMessage({id: 'message.hasRead'}) : formatMessage({id: 'message.unRead'})}</span>
        </p>
      }
    }, {
      title: `${formatMessage({id: 'message.table.title2'})}`,
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    }, {
      title: `${formatMessage({id: 'message.table.content'})}`,
      dataIndex: 'info',
      key: 'info',
      render: (info) => {
      return ( info.isShow
          ? <div className={styles.contents}><span>{info.content}</span><img src={topIcon} alt="" onClick={this.changeIsShow2.bind(this, info.index)} /></div>
          : <div className={`${styles.contents} ${styles.slideDown}`}><span>{info.content}</span><img src={bottomIcon} alt="" onClick={this.changeIsShow.bind(this, info.index)} /></div>
        )
      }
    }, {
      title: `${formatMessage({id: 'message.table.time'})}`,
      dataIndex: 'createTime',
      key: 'createTime',
    }, {
      title: `${formatMessage({id: 'message.table.action'})}`,
      dataIndex: 'h5Url',
      key: 'h5Url',
      render: (h5Url) => {
        return <a target="_blank" rel="noopener noreferrer" style={{display: h5Url && h5Url !== '' ? 'inline' : 'none'}} href={h5Url}>{formatMessage({id: 'message.table.details'})}</a>
      }
    }];

    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'message.title'})}`}>
        <div className={styles.messageWrap}>
          <div className={styles.unread}>
            <p>{formatMessage({id: 'message.list'})}</p>
            {/* <p>{formatMessage({id: 'message.unRead'})}: <span>{unReadCount}</span></p> */}
          </div>
          <Table onRow={item => { return { onClick: () => this.addRead(item.noticeId, item.serial.read, item.index) } }} rowKey={item => item.noticeId} align="center" columns={column} dataSource={messageList} bordered={true} className={styles.table} pagination={pagination} onChange={this.changePage.bind(this)} />
        </div>
      </DocumentTitle>
    )
  }
}

export default withRouter(connect(({ message, global }) => ({
  message, global
}))(Message));

