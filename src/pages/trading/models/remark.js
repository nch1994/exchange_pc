// user_id    用户ID
// cont_id    合约ID
// lever    杠杆
// rec_type    1开多0开空11平多10平空
// sheet    委托张数
// average    委托价格
// usdt_amount   交易价格
// bond    保证金
// profit    收益
// service_charge    手续费
// state   1委托中2已完成3已取消
// createTime   委托时间
// cont_type   1限价0市价2爆仓
// 开仓均价和持仓均价一样，没区别  average 
// 持仓保证金  bond
// 未实现盈亏  profit
// 收益 settle
// 收益率 rate
// 持仓量 sheet
// 可平量  usable
// 开仓都是买bid。平仓都是卖ask

// 开多对应平多，开空对应平空