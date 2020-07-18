import React, { Component } from "react";
import styles from './index.less';
import PrimaryView from './primary/index';
import SeniorView from './senior/index';
import DocumentTitle from 'react-document-title';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import router from 'umi/router';
import { getCookie } from '@/utils/utils'

class Auth extends Component {
  state = {
    grade: 0,
    user: '',
    card: ''
  };
  componentDidMount() {
    const userInfo = JSON.parse(getCookie('userInfo'));
    if (userInfo.face) {
      router.replace('/mine');
    }
  }
  handleNextBtn(user, card) {
    this.setState({
      grade: 1,
      user,
      card
    })
  };
  
  render () {
    const { grade, user, card } = this.state;
    return (
      <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'auth'})}`}>
        <div className={styles.authWrap}>
          <div style={{display: grade === 0 ? 'block' : 'none'}} className={styles.primary}>
            <PrimaryView onNextBtn={this.handleNextBtn.bind(this)} />
          </div>
          <div style={{display: grade === 1 ? 'block' : 'none'}} className={styles.senior}>
            <SeniorView realName={user} idNumber={card} />
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

Auth.defaultProps = {

}
export default connect(({ global }) => ({
  global
}))(Auth);