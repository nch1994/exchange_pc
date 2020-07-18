import { Component } from "react";
import styles from './index.less';
import LogoIcon from '@/assets/image/logo.png';
import wechatIcon from '@/assets/image/wechat.jpg';
import { formatMessage } from 'umi/locale';
import { aboutUrl } from '@/utils/utils';

class BottomLayout extends Component {
  render () {
    return (
      <div className={styles.baseBottom}>
        <div className={styles.baseBottomInner}>
          <div className={styles.baseBottomLeft}>
            <img src={LogoIcon} alt=""/>
            <p className={styles.copy}>©2019-2020 STARQUEEN Future Exchange</p>
            <p className={styles.notice}>{formatMessage({id: 'bottom.notice'})}</p>
          </div>
          <div className={styles.baseBottomRight}>
            <ul>
              <li>{formatMessage({id: 'bottom.platform'})}</li>
              {/* <li>{formatMessage({id: 'bottom.platform.about'})}</li> */}
              <li><a target="_blank" rel="noopener noreferrer" href={`${aboutUrl}/agree.html`}>{formatMessage({id: 'bottom.platform.agreement'})}</a></li>
              <li><a target="_blank" rel="noopener noreferrer" href={`${aboutUrl}/license.pdf`}>{formatMessage({id: 'bottom.platform.license'})}</a></li>
              <li><a target="_blank" rel="noopener noreferrer" href={`${aboutUrl}/guide.pdf`}>{formatMessage({id: 'bottom.platform.guide'})}</a></li>
              {/* <li>{formatMessage({id: 'bottom.platform.notices'})}</li>
              <li>{formatMessage({id: 'bottom.platform.safe'})}</li> */}
            </ul>
            <ul>
              {/* <li>{formatMessage({id: 'bottom.service'})}</li>
              <li>{formatMessage({id: 'bottom.service.help'})}</li>
              <li>{formatMessage({id: 'bottom.service.app'})}</li>
              <li>{formatMessage({id: 'bottom.service.rate'})}</li> */}
            </ul>
            <ul>
              <li>{formatMessage({id: 'bottom.contact'})}</li>
              {/* <li>{formatMessage({id: 'bottom.contact.wechat'})}</li>
              <li>{formatMessage({id: 'bottom.contact.email'})}</li> */}
              <li>
                <img className={styles.wechat} src={wechatIcon} alt=""/>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    )
  }
}
export default BottomLayout;