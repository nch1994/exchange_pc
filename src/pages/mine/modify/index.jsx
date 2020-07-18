import React, { Component } from 'react';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { Form, Input, Button, Row, Col } from 'antd';
import reg from '@/utils/reg';
import { connect } from 'dva';
import md5 from 'md5';
import { getCookie, decryptByDES, removeCookie } from '@/utils/utils';
import router from 'umi/router';

let timer = null;
class modifyFund extends Component {
  state={
    disabled: false,
    confirmDirty: false
  }
  cancle () {
    clearTimeout(timer);
    this.props.form.resetFields();
    const { dispatch } = this.props;
    dispatch({
      type: 'mine/hideAll'
    })
  };
  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value === form.getFieldValue('oldPwd')) {
      callback(formatMessage({id: 'notice.input.modify.password.error'}));
    } else if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPwd'], { force: true })
    }
    callback();
  }
  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPwd')) {
      callback(formatMessage({id: 'notice.confirm.password.error'}));
    } else {
      callback();
    }
  };
  handleSubmit = e => {
    e.preventDefault();
    const { mine: { layerTypes } } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dispatch } = this.props;
        const userId = decryptByDES(getCookie('token')) || '';
        if (userId === '') {
          removeCookie('userInfo');
          removeCookie('token');
          router.replace('/')
        }
        const originalPassword = md5(values.oldPwd);
        const newPassword = md5(values.newPwd);
        const type = layerTypes === 'fund' ? 1 : 0; // 0为登录密码； 1为交易密码
        this.setState({
          disabled: true
        })
        timer = setTimeout(() => {
          this.setState({
            disabled: false
          })
        }, 3000)
        dispatch({
          type: 'mine/modifyPassword',
          payload: {newPassword, originalPassword, type, userId},
          callback: () => {
            dispatch({
              type: 'mine/hideAll'
            })
          }
        })
      }
    });
  }
  changeCount(event) {
    const { mine: { layerTypes } } = this.props;
    if (layerTypes === 'fund') {
      event.target.value = event.target.value.replace(/\D/g,'');
    }
  }
  showForgetFn() {
    const { dispatch } = this.props;
    this.cancle();
    dispatch({
      type: 'mine/showForget',
      payload: true
    })
    dispatch({
      type: 'mine/actionType',
      payload: 'forget'
    })
  }
  componentWillUnmount() {
    this.cancle()
  }
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  render () {
    const { disabled } = this.state;
    const { mine: { layerTypes }, form:{ getFieldDecorator } } = this.props;
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
    const newPwdError = layerTypes === 'fund' ? formatMessage({id: 'notice.input.fund.password.error'}) : formatMessage({id: 'notice.input.RegisterNewpassword.error'});
    const patternReg = layerTypes === 'fund' ? new RegExp(reg.number, "g") : new RegExp(reg.registerNewPassword, 'g');
    return (
      <div className={styles.container}>
        <div className={styles.login}>
          <p className={styles.title}>{layerTypes === 'fund' ? formatMessage({id: 'mine.modify.fund.password'}) : formatMessage({id: 'mine.modify.login.password'})}</p>
          <Form labelCol={{ span: 4 }} labelAlign='left' wrapperCol={{ span: 20 }} onSubmit={this.handleSubmit} className={styles.list}>
            <Form.Item label={formatMessage({id: 'oldPwd'})} colon={false}>
              <Row gutter={8}>
                <Col span={19}>
                  {getFieldDecorator('oldPwd', {
                    rules: [{ required: true, message: newPwdError, pattern: patternReg }]
                  })(
                    <Input.Password onChange={this.changeCount.bind(this)} placeholder={formatMessage({id: 'input.old.password'})} />,
                  )}
                </Col>
                <Col span={5}><span className={styles.forgetPwd} onClick={this.showForgetFn.bind(this)}>{formatMessage({id: 'forget'})}</span></Col>
              </Row>
              
            </Form.Item>
            <Form.Item label={formatMessage({id: 'newPwd'})} colon={false}>
              {getFieldDecorator('newPwd', {
                rules: [{ required: true, message: newPwdError, pattern: patternReg }, { validator: this.validateToNextPassword }],
              })(
                <Input.Password placeholder={formatMessage({id: 'input.new.password'})} onChange={this.changeCount.bind(this)} />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({id: 'confirmPwd'})} colon={false}>
              {getFieldDecorator('confirmPwd', {
                rules: [{ required: true, message: formatMessage({id: 'input.confirm.new.password'}) }, { validator: this.compareToFirstPassword }],
              })(
                <Input.Password placeholder={formatMessage({id: 'input.confirm.new.password'})} onBlur={this.handleConfirmBlur} onChange={this.changeCount.bind(this)} />,
              )}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <div className={styles.btnWrap}>
                <Button type="primary" htmlType="submit" disabled={disabled}>{formatMessage({id: 'confirm'})}</Button>
                <Button type="default" onClick={() => this.cancle()}>{formatMessage({id: 'cancel'})}</Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(connect(({ mine, global }) => ({
  mine, global
}))(modifyFund));