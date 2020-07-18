import React, { Component } from "react";
import styles from './index.less';
import defaultIcon from '@/assets/image/default.png';
import { Form, Input, Button, Avatar } from 'antd';
import { formatMessage } from 'umi/locale';
import { showErrorMessage, getCookie, setCookie, decryptByDES, removeCookie } from '@/utils/utils';
import { connect } from 'dva';
import router from 'umi/router';
const { TextArea } = Input;

let timer = null;
class Auth extends Component {
  state = {
    disabled: false,
    isShowPersonalLayer: false
  };
  componentDidMount() {
    const userInfo = JSON.parse(getCookie('userInfo'));
    this.setState({
      header: userInfo.icon || ''
    })
  };
  changeHeader(event) {
    event.preventDefault();
    let formData = new FormData()
    const inputDOM = event.target.files[0];
    formData.append('file', inputDOM)
    formData.append('folderId', inputDOM.name)
    formData.append('softType', inputDOM.type)
    const picSize = inputDOM.size / 1024 / 1024;
    if ( picSize > 4) {
      showErrorMessage(`${formatMessage({id: 'notice.pic.size'})}`);
      return false;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'global/uploadImage',
      payload: formData,
      callback: (obj) => {
        this.setState({
          header: obj.path
        })
      }
    })
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const userId = decryptByDES(getCookie('token')) || '';
        if (userId === '') {
          removeCookie('userInfo');
          removeCookie('token');
          router.replace('/')
        }
        const { dispatch } = this.props;
        const { header } = this.state;
        const { nickName, introduce } = values;
        const data = `userId=${userId}&icon=${header}&nickName=${nickName}&introduce=${introduce}`;
        dispatch({
          type: 'mine/modifyUserInfo',
          payload: data,
          callback: () => {
            const userInfo = JSON.parse(getCookie('userInfo'));
            userInfo.nickName = nickName;
            userInfo.icon = header;
            userInfo.introduce = introduce;
            setCookie('userInfo', JSON.stringify(userInfo))
            this.setState({
              isShowPersonalLayer: false
            })
          }
        })
      }
    });
  }
  componentWillUnmount () {
    clearTimeout(timer)
  }
  hideModifyLayer() {
    this.setState({
      isShowPersonalLayer: false
    })
  }
  showModifyLayer() {
    this.setState({
      isShowPersonalLayer: true
    })
  }
  render () {
    const userInfo = JSON.parse(getCookie('userInfo'));
    const { isShowPersonalLayer, header } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 20,
          offset: 4,
        },
        sm: {
          span: 20,
          offset: 4,
        },
      },
    };
    const personalLower = 
    <div className={styles.personallayer_inner}>
      <p className={styles.title}>{userInfo.nickName ? formatMessage({id: 'modify'}) : formatMessage({id: 'mine.setting'})}{formatMessage({id: 'mine.title'})}</p>
      <Form labelCol={{ span: 4 }} labelAlign='left' wrapperCol={{ span: 20 }} onSubmit={this.handleSubmit} className={styles.list}>
        <Form.Item label={formatMessage({id: 'leader.header'})} colon={false}>
          <div className={styles.header}>
            <Avatar src={header || defaultIcon} className={styles.img} size={80} alt="" shape="square" />
            <input type="file" onChange={this.changeHeader.bind(this)} multiple={false} accept="image/jpg,image/jpeg,image/png,image/bmp" />
          </div>
        </Form.Item>
        <Form.Item label={formatMessage({id: 'leader.nickName.leader'})} colon={false}>
          {getFieldDecorator('nickName', {
            rules: [{ required: true, message: formatMessage({id: 'notice.not.nickname'}) }, { validator: this.validateToNextPassword }],
            initialValue: userInfo.nickName
          })(
            <Input placeholder={formatMessage({id: 'leader.nickName.input'})} autoComplete="off" />,
          )}
        </Form.Item>
        <Form.Item label={formatMessage({id: 'leader.introduce'})} colon={false}>
          {getFieldDecorator('introduce', {
            initialValue: userInfo.introduce
          })(
            <TextArea placeholder={formatMessage({id: 'leader.introduce.input'})} />
          )}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <div className={styles.btnWrap}>
            <Button type="primary" htmlType="submit">{formatMessage({id: 'confirm'})}</Button>
            <Button type="default" onClick={() => this.hideModifyLayer()}>{formatMessage({id: 'cancel'})}</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
    const personal = <div className={styles.personal}>
      <div className={styles.header}>
        <img src={userInfo.icon || defaultIcon} alt=""/>
      </div>
      <ul className={styles.personal_right}>
        <li>
          <label htmlFor="">{formatMessage({id: 'leader.nickName.leader'})}：</label>
          <p>{userInfo.nickName || formatMessage({id: 'notice.not.nickname'})}</p>
        </li>
        <li>
          <label htmlFor="">{formatMessage({id: 'leader.introduce'})}：</label>
          <p>{userInfo.introduce || formatMessage({id: 'notice.not.introduce'})}</p>
        </li>
      </ul>
      <p className={styles.modify} onClick={() => this.showModifyLayer()}>{userInfo.nickName ? formatMessage({id: 'modify'}) : formatMessage({id: 'mine.setting'})}</p>
    </div>
    return (
      <div className={styles.authWrap}>
        <div className={styles.authTop}>
          <div className={styles.authTopTitle}>
            <div>
              <span className={styles.title}>{formatMessage({id: 'mine.title'})}</span>
              <span className={styles.line}></span>
            </div>
          </div>
          <div className={styles.authTopContent}>
            {personal}
          </div>
        </div>
        <div style={{display: isShowPersonalLayer ? 'block' : 'none'}} className={styles.personalLayer}>
          {personalLower}
        </div>
      </div>
    )
  }
}

Auth.defaultProps = {

}
export default Form.create()(connect(({ user, global }) => ({
  user, global
}))(Auth));