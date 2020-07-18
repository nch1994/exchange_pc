
import { Layout, Spin } from 'antd';
import BaseLayout from './baseLayout/index';
import styles from './index.less';
import { connect } from 'dva';
const { Content } = Layout;


const UserLayout = props => {
  const { location, global: { loading } } = props;
  const { pathname } = location;
  let clientHeight = document.body.clientHeight;
  return (
    <div className={styles.wrapper} style={{ height: clientHeight, Width: 1316, }}>
      <Spin spinning={loading} delay={500}>
        <BaseLayout pathname={pathname} />
        <Content className={styles.content} style={{minHeight: `${clientHeight}px`}}>
          {props.children}
        </Content>
      </Spin>
    </div>
  )
}

export default connect(({ global }) => ({
  global
}))(UserLayout);