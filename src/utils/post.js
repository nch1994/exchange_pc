// 签名
import { getSign } from '@/utils/utils';
import moment from 'moment';
// 获取验证码
export function getCodeSign(countryCode, number) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}number${number}timestamp${timestamp}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&number=${number}&timestamp=${timestamp}&sign=${sign}`
  return data;
}
// 认证
export function authSign (realName, idNumber, front, back, face, userId) {
  const timestamp = moment().format("X");
  const datas = `back${back}face${face}front${front}idNumber${idNumber}realName${realName}timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `back=${back}&face=${face}&front=${front}&idNumber=${idNumber}&realName=${encodeURIComponent(realName)}&sign=${sign}&timestamp=${timestamp}$userId=${userId}`
  return data;
}
// 绑定邮箱或手机号
export function bindSign (countryCode, number, verificationCode, userId) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}number${number}timestamp${timestamp}userId${userId}verificationCode${verificationCode}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&number=${number}&sign=${sign}&timestamp=${timestamp}&userId=${userId}&verificationCode=${verificationCode}`;
  return data;
}
// 登录
export function loginSign (countryCode, number, password) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}number${number}password${password}timestamp${timestamp}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&number=${number}&password=${password}&sign=${sign}&timestamp=${timestamp}`;
  return data;
}

// 登录验证 -- 手机号和邮箱
export function loginVerifySignAll (countryCode, email, emailVerificationCode, mobile, mobileVerificationCode) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}email${email}emailVerificationCode${emailVerificationCode}mobile${mobile}mobileVerificationCode${mobileVerificationCode}timestamp${timestamp}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&email=${email}&emailVerificationCode=${emailVerificationCode}&mobile=${mobile}&mobileVerificationCode=${mobileVerificationCode}&sign=${sign}&timestamp=${timestamp}`;
  return data;
}
// 登录验证--手机号
export function loginVerifySignMobile (countryCode, mobile, mobileVerificationCode) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}mobile${mobile}mobileVerificationCode${mobileVerificationCode}timestamp${timestamp}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&mobile=${mobile}&mobileVerificationCode=${mobileVerificationCode}&sign=${sign}&timestamp=${timestamp}`;
  return data;
}

// 登录验证--邮箱
export function loginVerifySignEmail (countryCode, email, emailVerificationCode) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}email${email}emailVerificationCode${emailVerificationCode}timestamp${timestamp}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&email=${email}&emailVerificationCode=${emailVerificationCode}&sign=${sign}&timestamp=${timestamp}`;
  return data;
}

// 修改密码
export function modifyPasswordSign (newPassword, originalPassword, type, userId) {
  const timestamp = moment().format("X");
  const datas = `newPassword${newPassword}originalPassword${originalPassword}timestamp${timestamp}type${type}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `newPassword=${newPassword}&originalPassword=${originalPassword}&sign=${sign}&timestamp=${timestamp}&type=${type}&userId=${userId}`;
  return data;
}

// 注册
export function registerSign (countryCode, number, verificationCode, password, inviteCode) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}inviteCode${inviteCode}number${number}password${password}timestamp${timestamp}verificationCode=${verificationCode}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&inviteCode=${inviteCode}&number=${number}&password=${password}&sign=${sign}&timestamp=${timestamp}&verificationCode=${verificationCode}`;
  return data;
}

// 忘记密码
export function forgetPassword(newPassword, countryCode, number, type, verificationCode) {
  const timestamp = moment().format("X");
  const datas = `countryCode${countryCode}newPassword${newPassword}number${number}timestamp${timestamp}type${type}verificationCode=${verificationCode}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `countryCode=${countryCode}&newPassword=${newPassword}&number=${number}&sign=${sign}&timestamp=${timestamp}&type=${type}&verificationCode=${verificationCode}`;
  return data;
}

// 修改邮箱验证
export function updateEmailAuthSign(userId) {
  const timestamp = moment().format("X");
  const datas = `timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 修改手机验证
export function updateMobileAuthSign(userId) {
  const timestamp = moment().format("X");
  const datas = `timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 获取用户信息
export function userInfoSign(userId) {
  const timestamp = moment().format("X");
  const datas = `timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 取消委托
export function cancelEntrustSign(recId) {
  const timestamp = moment().format("X");
  const datas = `recId${recId}timestamp${timestamp}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `recId=${recId}&sign=${sign}&timestamp=${timestamp}`;
  return data;
}

// 提交委托
export function subEntrustSign(average, contId, recType, sheet, userId) {
  const timestamp = moment().format("X");
  const datas = `average${average}contId${contId}recType${recType}sheet${sheet}timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `average=${average}&contId=${contId}&recType=${recType}&sheet=${sheet}&sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 资金账户和合约信息
export function accountSign(userId, coinType) {
  const timestamp = moment().format("X");
  const datas = `coinType${coinType}timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `coinType=${coinType}&sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 资金账户
export function detailsSign(userId, coinType) {
  const timestamp = moment().format("X");
  const datas = `coinType${coinType}timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `coinType=${coinType}&sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 资金划转
export function transferSign(amount, coinType, contractType, fundsTransfer, userId ) {
  const timestamp = moment().format("X");
  const datas = `amount${amount}coinType${coinType}contractType${contractType}fundsTransfer${fundsTransfer}timestamp${timestamp}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `amount=${amount}&coinType=${coinType}&contractType=${contractType}&fundsTransfer=${fundsTransfer}&sign=${sign}&timestamp=${timestamp}&userId=${userId}`;
  return data;
}

// 提币--手机号
export function withdrawSign(amount, coinId, toAddress, tradePassword, userId, mobileVerificationCode) {
  const timestamp = moment().format("X");
  const datas = `amount${amount}coinId${coinId}mobileVerificationCode${mobileVerificationCode}timestamp${timestamp}toAddress${toAddress}tradePassword${tradePassword}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `amount=${amount}&coinId=${coinId}&mobileVerificationCode=${mobileVerificationCode}&sign=${sign}&timestamp=${timestamp}&toAddress=${toAddress}&tradePassword=${tradePassword}&userId=${userId}`;
  return data;
}
// 提币--邮箱
export function withdrawSignEmail(amount, coinId, toAddress, tradePassword, userId, mobileVerificationCode, emailVerificationCode) {
  const timestamp = moment().format("X");
  const datas = `amount${amount}coinId${coinId}emailVerificationCode${emailVerificationCode}mobileVerificationCode${mobileVerificationCode}timestamp${timestamp}toAddress${toAddress}tradePassword${tradePassword}userId${userId}`;
  const sign = encodeURIComponent(getSign(datas));
  const data = `amount=${amount}&coinId=${coinId}&emailVerificationCode=${emailVerificationCode}&mobileVerificationCode=${mobileVerificationCode}&sign=${sign}&timestamp=${timestamp}&toAddress=${toAddress}&tradePassword=${tradePassword}&userId=${userId}`;
  return data;
}