import { Button, Result } from 'antd';
import React from 'react';
import router from 'umi/router'; // 这里应该使用 antd 的 404 result 组件，
// 但是还没发布，先来个简单的。

const NoFoundPage = () => (
  <Result
    status="404"
    title="404"
    // subTitle="Sorry, the page you visited does not exist."
    subTitle="对不起，您访问的页面不存在。"
    extra={
      <Button type="primary" onClick={() => router.replace('/')}>
        返回首页
      </Button>
    }
  ></Result>
);

export default NoFoundPage;
