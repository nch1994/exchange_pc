
import { formatMessage } from 'umi/locale';
import { Result, Button } from 'antd';
import React from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { getCookie, decryptByDES } from '@/utils/utils';
const { Route } = require('dva').router;

const AuthRouter = (props) => {
  const { route } = props;
  const { component: Component } = route;
  const userId = decryptByDES(getCookie('token')) || '';
  return (
    //true ? <Route {...route} /> : <Redirect to="/login" />
    //这个也可以，跟下边的二选一，否则会报错 
    <Route render={ props => {
      // return userId !== '' ? <Component { ...props } /> : <Redirect to="/user/login" />
      return userId !== ''
        ? <Component { ...props } />
        : <Result status="403"
            // title="403"
            subTitle={`${formatMessage({id: 'notice.login'})}`}
            extra={
              <Button type="primary" onClick={() => router.push('/user/login')}>
                {formatMessage({id: 'confirm'})}
              </Button>
            }
          />
    }} />
  )
}

export default connect(({ global }) => ({
  global,
}))(AuthRouter);