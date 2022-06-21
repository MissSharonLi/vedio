import axios from 'axios'
import md5 from 'js-md5'
import { Message, Loading } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
const paramsList = ['get', 'delete', 'patch']
const dataList = ['post', 'put']

// 公共服务(加载中...)
const common = {
  loading: null,
  needLoadingRequestCount: 0,
  startLoading: () => {
    common.loading = Loading.service({
      lock: true,
      text: '加载中……',
      fullscreen: true,
      background: 'rgba(225, 225, 225, 0.7)'
    })
  },
  endLoading: () => {
    common.loading.close()
  },
  showFullScreenLoading: () => {
    if (common.needLoadingRequestCount === 0) common.startLoading() // 当等于0时证明第一次请求 这时开启loading
    common.needLoadingRequestCount++ // 全局变量值++
  },
  tryHideFullScreenLoading: () => {
    if (common.needLoadingRequestCount <= 0) return // 小于等于0 证明没有开启loading 此时return
    common.needLoadingRequestCount-- // 正常响应后 全局变量 --
    if (common.needLoadingRequestCount === 0) common.endLoading() // 等于0 时证明全部加载完毕 此时结束loading 加载
  }
}

/**
 * 参数md5加密
 * @param {Object} params - 参数
 */

const jsonSort = params => {
  params.time = new Date().getTime()
  let token = ''
  const arr = []
  const json = {}
  for (var key in params) {
    arr.push(key)
  }
  arr.sort()
  for (var i in arr) {
    token += md5(params[arr[i]] + '') + 'screen'
    json[arr[i]] = params[arr[i]]
  }
  token = md5('scr_' + token + '_een')
  json.token = token
  const myJson = JSON.stringify(json)
  return JSON.parse(myJson)
}

/**
 * 处理空参数都为null
 * @param {Object} params - 参数
 */
const handlerNullParams = config => {
  const params = config[isTypeList(config.method)]
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const val = params[key]
      if (val === '') {
        params[key] = null
      }
    }
  }
}
/**
 * RESTFUL请求设置参数位置
 * @param {string} method 方法 get|delete|patch|post|put
 * @returns
 */
const isTypeList = method => {
  if (paramsList.includes(method)) {
    return 'params'
  } else if (dataList.includes(method)) {
    return 'data'
  }
}

// 默认配置
const defaultParams = {
  baseURL: '/',
  validateStatus: status => status < 500, // 拦截状态码大于500
  headers: {
    common: { Accept: 'application/json; charset=UTF-8' },
    patch: { 'Content-Type': 'application/json; charset=UTF-8' },
    post: { 'Content-Type': 'application/json; charset=UTF-8' },
    put: { 'Content-Type': 'application/json; charset=UTF-8' }
  },
  transformRequest: [data => JSON.stringify(data)],
  timeout: 30000, // 请求超时时间
  isRepeatRequest: false, // 是否开启重复请求拦截
  isResetEmptyParams: false, // 是否开启重置空参数
  request: null,
  requestError: null,
  response: null,
  responseError: null
}

/**
 * 创建axios实例，参数如上，基本axios官方相同，除了isRepeatRequest、request、requestError、response、responseError
 * @param {Function} params.isRepeatRequest - 是否开启重复请求拦截
 * @param {Function} params.request - 请求前拦截
 * @param {Function} params.requestError - 请求前拦截异常处理
 * @param {Function} params.response - 请求后拦截
 * @param {Function} params.responseError - 请求后拦截异常处理
 * @param {object} store - vuex实例
 * @returns { GET, DEL, POST, PUT, PATCH, POST_FILE, GET_EXPORT }
 */
export default (params = defaultParams, store) => {
  params = Object.assign(defaultParams, params || {})
  // 创建axios实例
  const service = axios.create(params)

  const { request, requestError, response, responseError, isResetEmptyParams } = params

  /**
   * 请求前拦截
   * @param {object} config - axios实例
   */
  const defaultRequest =
    request ||
    (config => {
      if (config.loading) common.showFullScreenLoading()
      // 添加token
      config.headers.token = jsonSort(config[isTypeList(config.method)]).token
      // 处理为空的参数，设置为null
      isResetEmptyParams && handlerNullParams(config)
      return config
    })

  /**
   * 请求前拦截异常处理
   * @param {object} config - axios实例
   */
  const defaultRequestError = requestError || (error => Promise.reject(error))

  /**
   * 请求后拦截
   * @param {object} config - axios实例
   */
  const defaultResponse =
    response ||
    (response => {
      common.tryHideFullScreenLoading()
      const res = response.data

      if (response.config.responseType === 'blob') {
        if (response.data instanceof Blob) {
          return res
        } else {
          Message.error('导出文件类型异常')
          console.error(response)
          return Promise.reject(new Error('导出流异常'))
        }
      } else if (res instanceof Object && !res.code) {
        return {
          code: 200,
          data: res
        }
      }

      if (res.code === 200) {
        return Promise.resolve(res)
        // return res
      } else {
        // isHandleResponse 是否业务自行处理响应
        if (!response.config.isHandleResponse) {
          Message.error(res.msg)
        }
        // return res
        return Promise.reject(res)
      }
    })

  /**
   * 请求后拦截异常处理
   * @param {object} config - axios实例
   */
  const defaultResponseError =
    responseError ||
    (error => {
      common.tryHideFullScreenLoading()
      if (!(error && ['取消重复请求', 'cancelToken'].includes(error.msg))) {
        if (error && error.response) {
          Message.error('系统异常')
        } else {
          Message.error('系统异常')
        }
      }
      return Promise.reject(error)
    })

  // request 请求前拦截
  service.interceptors.request.use(defaultRequest, defaultRequestError)

  // response 请求后拦截器
  service.interceptors.response.use(defaultResponse, defaultResponseError)

  /**
   * get请求方法
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} params - 请求参数
   * @returns
   */
  const GET = (url, params = {}, loading = false, baseURL = '/api') => {
    params.t = new Date().getTime() // get方法加一个时间参数,解决ie下可能缓存问题.
    return service({
      url: url,
      method: 'GET',
      params,
      baseURL: baseURL,
      loading: loading
    })
  }
  /**
   * delete请求方法
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} params - 请求参数
   * @returns
   */
  const DEL = (url, params = {}) => {
    params.t = new Date().getTime() // get方法加一个时间参数,解决ie下可能缓存问题.
    return service({
      url: url,
      method: 'DELETE',
      params
    })
  }

  /**
   * post请求方法
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} data - 请求参数
   * @returns
   */
  const POST = (url, data = {}, other = {}, loading = false, baseURL = '/api') => {
    return service({
      url,
      method: 'POST',
      ...(other || {}),
      data,
      baseURL: baseURL,
      loading: loading
    })
  }

  /**
   * put请求方法
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} data - 请求参数
   * @returns
   */
  const PUT = (url, data = {}, loading = false, baseURL = '/api') => {
    return service({
      url,
      method: 'PUT',
      data,
      baseURL: baseURL,
      loading: loading
    })
  }

  /**
   * patch请求方法
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} data - 请求参数
   * @returns
   */
  const PATCH = (url, params = {}) => {
    return service({
      url,
      method: 'PATCH',
      params
    })
  }

  /**
   * post上传文件请求方法
   * !! 必须使用formData方式
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} data - 请求参数
   * @returns
   */
  const POST_FILE = (url, data = {}) => {
    return service({
      url,
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data;charset=UTF-8'
      },
      transformRequest: [data => data]
    })
  }

  /**
   * get导出文件
   * @export axios
   * @param {String} url - 请求地址
   * @param {Object} data - 请求参数
   * @returns
   */
  const GET_EXPORT = (url, params = {}) => {
    return service({
      url,
      method: 'GET',
      params,
      responseType: 'blob',
      timeout: 1000 * 60 * 3
    })
  }
  const POST_EXPORT = (url, params = {}) => {
    return service({
      url,
      method: 'POST',
      params,
      responseType: 'blob',
      timeout: 1000 * 60 * 3
    })
  }

  return {
    service,
    GET,
    DEL,
    POST,
    PUT,
    PATCH,
    POST_FILE,
    POST_EXPORT,
    GET_EXPORT
  }
}
