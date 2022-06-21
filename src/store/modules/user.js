import { api } from '@/api'
import router from '@/router/index'
import { setLocalStorage } from '../../utils'

const state = {
  userInfo: {}, // 登录用户的所有数据
  storeInfo: {}, // 商家信息
  isLogin: false,
  loginUserInfo: null,
  // trtc 相关
  callStatus: '', // 状态, idle, calling, connected
  isInviter: false, // c2c 通话，说不定一开始不是 inviter, 后面邀请了别人就是 inviter 了
  isAccepted: false,
  meetingUserIdList: [],
  muteVideoUserIdList: [],
  muteAudioUserIdList: []
}

const mutations = {
  SET_STORE_INFO(state, data) {
    state.storeInfo = data || {}
    setLocalStorage('STOREINFO', data || {})
  },
  SET_USER_INFO(state, data) {
    state.userInfo = data || {}
    setLocalStorage('USERINFO', data || {})
  },
  userLoginSuccess(state) {
    state.isLogin = true
  },
  userLogoutSuccess(state) {
    state.isLogin = false
    state.loginUserInfo = null
  },
  setLoginUserInfo(state, payload) {
    const { userId, userSig } = payload
    state.loginUserInfo = {
      userId,
      userSig
    }
  },
  updateIsInviter(state, isInviter) {
    state.isInviter = isInviter
  },
  updateCallStatus(state, callStatus) {
    state.callStatus = callStatus
  },
  userJoinMeeting(state, userId) {
    if (state.meetingUserIdList.indexOf(userId) === -1) {
      state.meetingUserIdList.push(userId)
    }
  },
  userAccepted(state, isAccepted) {
    state.isAccepted = isAccepted
  },
  userLeaveMeeting(state, userId) {
    const index = state.meetingUserIdList.findIndex(item => item === userId)
    if (index >= 0) {
      state.meetingUserIdList.splice(index, 1)
    }
  },
  dissolveMeeting(state) {
    state.meetingUserIdList = []
    state.isMuteVideoUserIdList = []
    state.isMuteAudioUserIdList = []
  },
  updateMuteVideoUserIdList(state, userIdList) {
    state.muteVideoUserIdList = userIdList
  },
  updateMuteAudioUserIdList(state, userIdList) {
    state.muteAudioUserIdList = userIdList
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      api
        .login({ account: username.trim(), password: password })
        .then(res => {
          const { code, data } = res
          if (code === 200) {
            commit('SET_STORE_INFO', data)
            router.push({ name: 'ExpertList' })
          }
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
