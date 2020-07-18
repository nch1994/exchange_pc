import React, { Component } from 'react';
import styles from './index.less';
import { getCookie } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Form, Input, Button, Row, Col } from 'antd';
import md5 from 'md5';
import reg from '@/utils/reg';

let timer, timer2 = null;
class ForgetFund extends Component {
  state = {
    codeNotice: `${formatMessage({id: 'getCode'})}`,
    disabled: false,
    disabled2: false,
    confirmDirty: false
  }
  getCode() {
    const userInfo = JSON.parse(getCookie('userInfo'));
    const { dispatch } = this.props;
    const country = userInfo.countryCode; 
    if (this.beforeGetCode() === false) return;
    const number = userInfo.mobile || userInfo.email || '';
    const countryCode = reg.phone.test(number) ? country : '';
    dispatch({
      type: 'global/sendSMS',
      payload: {
        countryCode,
        number,
      }
    })
  };
  beforeGetCode() {
    let time = 60;
    this.setState({
      disabled: true
    })
    timer = setInterval(() => {
      --time;
      this.setState({
        codeNotice : `${time}s`
      })
      if (time === 0) {
        clearInterval(timer);
        this.setState({
          codeNotice: `${formatMessage({id: 'regainCode'})}`,
          disabled: false
        })
      }
    }, 1000)
  };
  cancle () {
    const { dispatch } = this.props;
    clearInterval(timer);
    clearTimeout(timer2);
    this.props.form.resetFields();
    this.setState({
      codeNotice: `${formatMessage({id: 'getCode'})}`,
      disabled: false,
      confirmDirty: false
    })
    dispatch({
      type: 'mine/hideAll'
    })
  };
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  handleSubmit = e => {
    e.preventDefault();
    const { mine: { layerTypes } } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const userInfo = JSON.parse(getCookie('userInfo'));
        const { dispatch } = this.props;
        const country = JSON.parse(getCookie('userInfo')).countryCode; 
        const number = userInfo.mobile || userInfo.email || '';
        const countryCode = reg.phone.test(number) ? country : '';
        const verificationCode = values.code;
        const newPassword = md5(values.forgetNewPwd);
        const type = layerTypes === 'fund' ? 1 : 0; // 0为登录密码； 1为交易密码
        this.setState({
          disabled2: true
        })
        timer2 = setTimeout(() => {
          this.setState({
            disabled2: false
          })
        }, 3000)
        dispatch({
          type: 'mine/resetPassword',
          payload: {newPassword, countryCode, number, type, verificationCode},
          callback: () => {
            dispatch({
              type: 'mine/hideAll'
            })
          }
        })
      }
    })
  }
  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['forgetConfirmPwd'], { force: true });
    }
    callback();
  }
  compareToNewPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('forgetNewPwd')) {
      callback(formatMessage({id: 'notice.confirm.password.error'}));
    } else {
      callback();
    }
  };
  componentWillUnmount() {
    this.cancle();
  }
  changeCount(event) {
    const { mine: { layerTypes } } = this.props;
    if (layerTypes === 'fund') {
      event.target.value = event.target.value.replace(/\D/g,'');
    }
  }
  render () {
    const userInfo = JSON.parse(getCookie('userInfo'));
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
    const { codeNotice, disabled2, disabled } = this.state;
    const { form: { getFieldDecorator }, mine: { layerTypes, actionTypes } } = this.props;
    let topTitle = '';
    if (actionTypes === 'setting') {
      topTitle = formatMessage({id: 'mine.setting.fund.password'})
    } else {
      topTitle = layerTypes === 'fund' ? formatMessage({id: 'mine.forget.fund.password'}) : formatMessage({id: 'mine.forget.login.password'})
    }
    const newPwdError = layerTypes === 'fund' ? formatMessage({id: 'notice.input.fund.password.error'}) : formatMessage({id: 'notice.input.RegisterNewpassword.error'});
    const patternReg = layerTypes === 'fund' ? new RegExp(reg.number, "g") : new RegExp(reg.registerNewPassword, 'g');
    return (
      <div className={styles.container}>
        <div className={styles.login}>
          <p className={styles.title}>{topTitle}</p>
          <Form labelCol={{ span: 4 }} labelAlign='left' wrapperCol={{ span: 20 }} onSubmit={this.handleSubmit} className={styles.list}>
            <Form.Item label={userInfo.mobile ? formatMessage({id: 'phone'}) : formatMessage({id: 'email'})} colon={false}>
              <Input type="text" value={userInfo.mobile || userInfo.email || ''} />
            </Form.Item>
            <Form.Item label={formatMessage({id: 'newPwd'})} colon={false}>
              {getFieldDecorator('forgetNewPwd', {
                rules: [{ required: true, message: newPwdError, pattern: patternReg }, { validator: this.validateToNextPassword }]
              })(
                <Input.Password placeholder={formatMessage({id: 'input.new.password'})} onChange={this.changeCount.bind(this)} />,
              )}
            </Form.Item>
            <Form.Item label={formatMessage({id: 'confirmPwd'})} colon={false}>
              {getFieldDecorator('forgetConfirmPwd', {
                rules: [
                  { required: true, message: formatMessage({id: 'input.confirm.new.password'}) },
                  { validator: this.compareToNewPassword }
                ],
              })(
                <Input.Password placeholder={formatMessage({id: 'input.confirm.new.password'})} onBlur={this.handleConfirmBlur} onChange={this.changeCount.bind(this)} />,
              )}
            </Form.Item>

            <Form.Item label={formatMessage({id: 'code'})} colon={false}>
              <Row gutter={8}>
                <Col span={18}>
                  {getFieldDecorator('code', {
                    rules: [{ required: true, message: formatMessage({id: 'notice.input.code.error'}) }]
                  })(
                    <Input placeholder={formatMessage({id: 'input.code'})} type="text" autoComplete="off" />,
                  )}
                </Col>
                <Col span={6}>
                  <Button disabled={disabled} type="default" onClick={this.getCode.bind(this)}>{codeNotice}</Button>
                </Col>
              </Row>
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <div className={styles.btnWrap}>
                <Button type="primary" htmlType="submit" disabled={disabled2}>{formatMessage({id: 'confirm'})}</Button>
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
}))(ForgetFund));