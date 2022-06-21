import { POST } from '../../sdk/fetch'

// 登录
export const login = params => POST('/ask/store/login', params)

// 专家列表
export const getExpertList = params => POST('/ask/teacher/teacher_list', params)

// 专家类型
export const getExpertTypeList = params => POST('/ask/teacher/service_list', params)

// 专家详情
export const getExpertDetails = params => POST('/ask/teacher/teacher_info', params)

// 获取扫码登录二维码
export const getScanLoginCode = params => POST('/ask/user/get_code', params)

// 扫码登录提交
export const doScanLogin = params => POST('/ask/user/login', params)

// 提交订单
export const handleAddOrder = params => POST('/ask/user/add_order', params)

// 支付
export const handleToPay = params => POST('/ask/user/pay', params)

// 获取订单支付状态
export const getPayResult = params => POST('/ask/user/get_pay_result', params)

// 获取音视频签名
export const getSign = params => POST('/ask/user/get_sign', params)

// 获取专家列表
export const getOrderList = params => POST('/ask/user/teacher_order_list', params)

// 获取专家完成
export const handleCompelte = params => POST('/ask/user/teacher_order_complete', params)

// 获取用户订单列表
export const getUserOrderList = params => POST('/ask/user/order_list', params)
