import React, { Component } from 'react';
import styles from './index.less';
import { getCookie, setCookie, decryptByDES, removeCookie } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import reg from '@/utils/reg';
import router from 'umi/router';
import { Form, Input, Button, Row, Col } from 'antd';

let timer = null;
let timer2 = null;
class Bindings extends Component {
  state = {
    codeNotice: `${formatMessage({id: 'getCode'})}`,
    disabled: false,
    disabled2: false
  }
  getCode = () => {
    if (this.beforeGetCode() === false) return;
    const { dispatch, form } = this.props;
    const country = JSON.parse(getCookie('userInfo')).countryCode;
    const number = form.getFieldValue('number');
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
    const { mine: { bindingType }, form } = this.props;
    let time = 60;
    const patternReg = bindingType === 0 ? reg.email : reg.phone;
    if (!patternReg.test(form.getFieldValue('number'))) {
      this.props.form.validateFields(['number'], { force: true });
      return false;
    }
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
      disabled2: false
    })
    dispatch({
      type: 'mine/hideAll'
    })
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      const { dispatch } = this.props;
      const userId = decryptByDES(getCookie('token')) || '';
      if (userId === '') {
        removeCookie('userInfo');
        removeCookie('token');
        router.replace('/')
      }
      const country = JSON.parse(getCookie('userInfo')).countryCode;
      const number = values.number;
      const countryCode = reg.phone.test(number) ? country : '';
      const verificationCode = values.bindingCode;
      this.setState({
        disabled2: true
      })
      timer2 = setTimeout(() => {
        this.setState({
          disabled2: false
        })
      }, 3000)
      dispatch({
        type: 'mine/bindingNumber',
        payload: { countryCode, number, verificationCode, userId},
        callback: () => {
          dispatch({
            type: 'mine/hideAll'
          })
          let userInfo = JSON.parse(getCookie('userInfo'));
          if (reg.phone.test(number)) {
            userInfo.mobile = number
          } else {
            userInfo.email = number
          }
          setCookie('userInfo', JSON.stringify(userInfo))
        }
      })
    })
  }
  componentWillUnmount() {
    this.cancle()
  }
  render () {
    const { mine: { bindingType }, form: { getFieldDecorator } } = this.props;
    const { codeNotice, disabled2, disabled } = this.state;
    const patternReg = bindingType === 0 ? new RegExp(reg.email, "g") : new RegExp(reg.phone, 'g');
    const numberError = bindingType === 0 ? formatMessage({id: 'notice.email'}) : formatMessage({id: 'notice.phone'});
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
    return (
      <div className={styles.container}>
        <div className={styles.login}>
          <p className={styles.title}>{bindingType === 0 ? formatMessage({id: 'mine.binding.email'}) : formatMessage({id: 'mine.binding.phone'})}</p>
          <Form labelCol={{ span: 4 }} labelAlign='left' wrapperCol={{ span: 20 }} onSubmit={this.handleSubmit} className={styles.list}>
            <Form.Item label={bindingType === 0 ? formatMessage({id: 'email'}) : formatMessage({id: 'phone'})} colon={false}>
              {getFieldDecorator('number', {
                rules: [{required: true, message: numberError, pattern: patternReg }]
              })(
                <Input type="text" placeholder={bindingType === 0 ? formatMessage({id: 'input.email'}) : formatMessage({id: 'input.phone'})} autoComplete="off" />
              )}
            </Form.Item>
            <Form.Item label={formatMessage({id: 'code'})} colon={false}>
              <Row gutter={8}>
                <Col span={18}>
                  {getFieldDecorator('bindingCode', {
                    rules: [{required: true, message: formatMessage({id: 'notice.input.code.error'}) }]
                  })(
                    <Input placeholder={formatMessage({id: 'input.code'})} type="text" autoComplete="off" />,
                  )}
                </Col>
                <Col span={6}><Button disabled={disabled} type="default" onClick={this.getCode}>{codeNotice}</Button></Col>
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
}))(Bindings));