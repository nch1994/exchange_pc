import request from '@/utils/request';
// export async function login(params) {
//   return request(`/user/login?${params}`, {
//     method: 'POST',
//   });
// }

// 首页-banner
export async function getBanner(params) {
  return request(`index/banners/${params}`)
}

// 首页--查询合约收益排名
export async function getProfit(params) {
  return request(`contract/getProfit/${params}`);
}

// 发送验证码
export async function sendSMS(params) {
  return request('common/sendVerificationCode', {
    method: 'POST',
    data: params,
  })
}

// 上传图片
export async function uploadImage(params) {
  return request('common/uploadImage', {
    method: 'POST',
    body: params,
  })
}
// 注册
export async function register(params) {
  return request('user/register', {
    method: 'POST',
    data: params,
  })
}

// 登录
export async function login(params) {
  return request('user/login', {
    method: 'POST',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// 登录授权
export async function loginVerification(params) {
  return request('user/loginVerification', {
    method: 'POST',
    data: params
  })
}

// 忘记密码
export async function resetPassword(params) {
  return request('user/resetPassword', {
    method: 'POST',
    data: params
  })
}

// 修改密码
export async function modifyPassword(params) {
  return request('user/modifyPassword', {
    method: 'POST',
    data: params
  })
}

// 邮箱验证
export async function bindingNumber(params) {
  return request('user/bindingNumber', {
    method: 'POST',
    data: params
  })
}

// 修改手机验证
export async function updateMobileAuth(params) {
  return request('user/updateMobileAuth', {
    method: 'POST',
    data: params
  })
}

// 修改邮箱验证
export async function updateEmailAuth(params) {
  return request('user/updateEmailAuth', {
    method: 'POST',
    data: params
  })
}

// 用户信息
export async function userInfo(params) {
  return request('user/userInfo', {
    method: 'POST',
    data: params
  })
}

// 邀请人数
export async function getInviteNum(params) {
  return request(`user/inviteNum/${params}`)
}

// 认证
export async function auth(params) {
  return request('user/auth', {
    method: 'POST',
    data: params
  })
}

// 合约--查询账户资产
export async function getAsset(params) {
  return request(`contract/getAsset?${params}`);
}

// 合约--获取所有合约信息
export async function getContracts() {
  return request('contract/getContracts');
}

// 合约-提交委托
export async function subEntrust(params) {
  return request('contract/subEntrust', {
    method: 'POST',
    data: params,
  })
}

// 合约--取消委托
export async function cancelEntrust(params) {
  return request('contract/cancelEntrust', {
    method: 'POST',
    data: params,
  })
}

// 合约--查询委托
export async function getEntrust(params) {
  return request(`contract/getEntrust?${params}`);
}

// 合约--添加止盈止损
export async function setStop(params) {
  return request('contract/setStop', {
    method: 'POST',
    data: params,
  })
}

// 合约--查询止盈止损
export async function queryStop(params) {
  return request(`contract/queryStop/${params}`)
}

// 合约--取消止盈止损
export async function cancelStop(params) {
  return request(`contract/cancelStop/${params}`)
}

// 合约--查询当前持仓
export async function getHold(params) {
  return request(`contract/getHold?${params}`)
}

// 合约--查询当前委托
export async function getStopRecord(params) {
  return request(`contract/stopRecord/${params}`)
}

// 合约--修改杠杆
export async function setLever(params) {
  return request(`contract/setLever`, {
    method: 'post',
    data: params
  })
}

// 分享-- 查询用户邀请奖励
export async function getUserReward(params) {
  return request(`contract/getUserReward/${params}`)
}

// 分销奖励
export async function getRewardList(params) {
  return request(`contract/getRewardList/${params}`)
}

// 分享-- 查询邀请奖励排名
export async function getReward(params) {
  return request(`contract/getReward/${params}`)
}

// 资金账户 -- 资金账户
export async function accountDetails(params) {
  return request('account/details', {
    method: 'POST',
    data: params,
  }) 
}

// 资金账户 -- 资金账户和合约账户信息
export async function getAccount(params) {
  return request('account/account', {
    method: 'POST',
    data: params
  })
}

// 资金账户--获取充币地址
export async function depositAddress(params) {
  return request('account/depositAddress', {
    method: 'POST',
    data: params
  })
}
// 资金账户--提币
export async function accountWithdraw(params) {
  return request('account/withdraw', {
    method: 'POST',
    data: params
  })
}

// 资金账户-交易记录
export async function tradeRecords(params) {
  return request(`account/tradeRecords?${params}`)
}

// 资金账户--资金划转
export async function fundsTransfer(params) {
  return request('account/fundsTransfer', {
    method: 'POST',
    data: params
  })
}

// 资金账户--
export async function getPoundage(params) {
  return request(`account/getPoundage?${params}`)
}

// 深度交易-BTC
export async function depthBTC() {
  return request('btc/btc', {
    method: 'POST'
  })
}
// 深度交易-ETH
export async function depthETH() {
  return request('eth/eth', {
    method: 'POST'
  })
}
// 深度交易-EOS
export async function depthEOS() {
  return request('eos/eos', {
    method: 'POST'
  })
}

// 涨幅--BTC
export async function btcPrice() {
  return request('btc/coinPrice', {
    method: 'POST'
  })
}

// k线--BTC
export async function kline(params) {
  return request(`btc/kline?${params}`, {
    method: 'POST'
  })
}

// 带单列表
export async function leaderList(params) {
  return request(`follow/leadCount?${params}`, {
    method: 'GET'
  })
}

// 查询带单按钮
export async function getLead(params) {
  return request(`follow/queryLead/${params}`, {
    method: 'GET'
  })
}

// 设置带单按钮
export async function setLead(params) {
  return request('follow/setLead', {
    method: 'POST',
    data: params
  })
}

// 社区 --- 交易员榜单
export async function communityRanking(params) {
  return request(`follow/ranking/${params}`, {
    method: 'GET'
  })
}

// 添加跟单
export async function addFollow(params) {
  return request('follow/addFollow', {
    method: 'POST',
    data: params
  })
}

// 查询跟单
export async function queryOnly(params) {
  return request(`follow/queryOnly?${params}`, {
    method: 'GET'
  })
}

// 查询全部跟单
export async function queryAll(params) {
  return request(`follow/queryAll?${params}`, {
    method: 'GET'
  })
}

// 修改跟单
export async function modifyFollow(params) {
  return request('follow/modifyFollow', {
    method: 'POST',
    data: params
  })
}
// 取消跟单
export async function cancelFollow(params) {
  return request('follow/cancelFollow', {
    method: 'POST',
    data: params
  })
}
// 修改用户信息

export async function modifyUserInfo(params) {
  return request(`user/updateUserIcon?${params}`, {
    method: 'POST',
  })
}

// 消息通知列表
export async function getMessageList(params) {
  return request(`index/notice/${params}`, {
    method: 'GET'
  })
}

// 消息未读数
export async function getUnreadCount(params) {
  return request(`index/unRead/${params}`, {
    method: 'GET'
  })
}

// 设置已读
export async function addRead(params) {
  return request(`index/addRead/${params}`, {
    method: 'GET'
  })
}

// 二元期权

// 获取期权列表
export async function getOptions() {
  return request('guess/getContracts', {
    method: 'get'
  })
}

// 获取账户余额
export async function guessAccount(params) {
  return request(`guess/getAccount/${params}`, {
    method: 'get'
  })
}

// 猜涨跌--资金记录
export async function guessAccountRecord(params) {
  return request(`guess/guessAccount/${params}`, {
    method: 'get'
  })
}

// 提交猜涨跌
export async function guessAddEntrust(params) {
  return request('guess/addEntrust', {
    method: 'post',
    data: params
  })
}

// 猜涨跌-当前与历史记录
export async function guessQueryEntrust(params) {
  return request(`guess/queryEntrust?${params}`, {
    method: 'get'
  })
}