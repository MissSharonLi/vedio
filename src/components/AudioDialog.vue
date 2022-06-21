<template>
  <ElDialog
    :title="title"
    :visible.sync="showDialog"
    width="1000px"
    center
    :before-close="handleCancel"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
  >
    <div class="video_wrap">
      <div class="content">
        <!-- 远端视频 -->
        <div v-for="(item, index) in remoteStreamList" :key="index" class="remote-stream">
          <div :class="{ 'distant-stream': item.view }" v-html="item.view"></div>
        </div>
        <!-- 本地视频 -->
        <div id="local_stream" class="local-stream"></div>
      </div>
    </div>
  </ElDialog>
</template>
<script>
import { api } from '@api'
import TRTC from 'trtc-js-sdk'
export default {
  data() {
    return {
      orderId: null,
      showDialog: false,
      loading: false,
      audioParams: {},
      userId: '',
      roomId: null,
      client: '', // 客户端服务
      remoteStream: '', // 远方播放流
      localStream: '', // 本地流
      remoteStreamList: [] // 远端小视频
    }
  },
  computed: {
    infoParams() {
      return {
        utoken: this.$store.state.userInfo.utoken,
        order_id: this.orderId
      }
    },
    title() {
      return this.audioParams.audio ? '正在语音' : '正在视频'
    }
  },
  methods: {
    initDialog(data) {
      const { audio, video, id } = data
      this.orderId = id
      this.audioParams = { audio, video }
      this.showDialog = true
      this.createClient()
    },
    handleCancel() {
      this.showDialog = false
      this.appid = ''
      this.redirect_uri = ''
      this.loading = false
      this.isAudio = false
      this.isVideo = false
      this.logoutHandler()
    },
    async createClient() {
      // 获取签名
      const { code, data } = await api.getSign(this.infoParams)
      if (code === 200) {
        const { SDKAppID: sdkAppId, userId, userSig, roomId } = data
        this.userId = userId
        this.roomId = roomId
        this.localStream = ''
        this.remoteStreamList = []
        this.client = await TRTC.createClient({
          mode: 'rtc',
          sdkAppId: Number(sdkAppId),
          userId,
          userSig
        })
        // 注册远程监听，要放在加入房间前--这里用了发布订阅模式
        this.subscribeStream(this.client)
        // 注册监听事件 如，房间关闭
        this.handleEvents(this.client)
        // 初始化后才能加入房间
        this.joinRoom(this.client, this.roomId)
      }
    },
    // 订阅远端流--加入房间之前
    subscribeStream(client) {
      client.on('stream-added', event => {
        const remoteStream = event.stream
        console.log('远端流增加: ' + remoteStream.getId())
        // 订阅远端流
        client.subscribe(remoteStream)
      })
    },
    handleEvents(client) {
      client.on('stream-subscribed', event => {
        const remoteStream = event.stream
        console.log('远端流订阅成功：' + remoteStream.getId())
        // 创建远端流标签，因为id是动态的，所以动态创建，用了v-html
        const remoteStreamItem = `<view id="${'remote_stream-' + remoteStream.getId()}"  ></view>`
        const isExist = this.remoteStreamList.find(item => item.userId === remoteStream.getUserId())
        if (!isExist) {
          this.remoteStreamList.push({
            id: remoteStream.getId(),
            userId: remoteStream.getUserId(),
            view: remoteStreamItem,
            hasVideo: true, // 是否开启了摄像头
            hasMic: true // 是否开启了麦克风
          })

          // 做了dom操作 需要使用$nextTick(),否则找不到创建的标签无法进行播放
          this.$nextTick(() => {
            // 播放远端流
            remoteStream.play('remote_stream-' + remoteStream.getId())
          })
        }
      })
    },
    // 加入房间
    joinRoom(client, roomId) {
      client
        .join({ roomId })
        .catch(error => {
          console.error('进房失败 ' + error)
        })
        .then(() => {
          console.log('进房成功')
          // 创建本地流
          this.createStream(this.userId)
        })
    },
    // 创建本地音频流
    async createStream(userId) {
      const localStream = TRTC.createStream({ userId, ...this.audioParams })
      // 设置视频属性 Profile 为 '480p'
      localStream.setVideoProfile('480p')

      this.localStream = localStream

      try {
        await localStream
          .initialize()
          .catch(error => {
            console.error('初始化本地流失败 ' + error)
          })
          .then(() => {
            console.log('初始化本地流成功')
            // 创建好后才能播放 本地流播放 local_stream 是div的id
            localStream.play('local_stream')
            // 创建好后才能发布
            this.publishStream(localStream, this.client)
          })
      } catch (error) {
        switch (error.name) {
          case 'NotReadableError':
            alert(
              '暂时无法访问摄像头/麦克风，请确保系统允许当前浏览器访问摄像头/麦克风，并且没有其他应用占用摄像头/麦克风'
            )
            break
          case 'NotAllowedError':
            if (error.message === 'Permission denied by system') {
              alert('请确保系统允许当前浏览器访问摄像头/麦克风')
            } else {
              console.log('User refused to share the screen')
              alert('请确保系统允许当前浏览器访问摄像头/麦克风')
            }
            break
          case 'NotFoundError':
            alert(
              '浏览器获取不到摄像头/麦克风设备，请检查设备连接并且确保系统允许当前浏览器访问摄像头/麦克风'
            )
            break
          default:
            break
        }
      }
    },
    // 发布本地音视频流
    publishStream(localStream, client) {
      client
        .publish(localStream)
        .catch(error => {
          console.error('本地流发布失败 ' + error)
        })
        .then(() => {
          console.log('本地流发布成功')
        })
    },

    // 退出房间
    logoutHandler() {
      if (this.client) this.leaveRoom(this.client)
    },
    leaveRoom(client) {
      client
        .leave()
        .then(() => {
          console.log('退房成功')
          // 停止本地流，关闭本地流内部的音视频播放器
          this.localStream.stop()
          // 关闭本地流，释放摄像头和麦克风访问权限
          this.localStream.close()
          this.localStream = null
          this.client = null
          // 退房成功，可再次调用client.join重新进房开启新的通话。
        })
        .catch(error => {
          console.error('退房失败 ' + error)
          // 错误不可恢复，需要刷新页面。
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.local-stream {
  width: 440px;
  height: 500px;
}
.remote-stream {
  width: 440px;
  height: 500px;
}
</style>
