<template>
  <div>
    <Header></Header>
    <div v-loading="loading" class="container">
      <section>
        <dl>
          <dt>
            <ElImage :src="returnInfo.image">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </ElImage>
          </dt>
          <dd>
            <h1>
              <span>{{ returnInfo.teacher_name }}</span>
              <span>{{ returnInfo.title }}</span>
            </h1>
            <p>
              <span>擅长领域：</span>
              <ElButton
                v-for="(item, index) in returnInfo.type_list"
                :key="index"
                type="primary"
                plain
                size="mini"
              >
                {{ item.type_name }}
              </ElButton>
            </p>
            <p>
              <span>服务方式：</span>
              <span v-for="(item, index) in returnInfo.service_list" :key="index" class="label">
                {{ item.service_name }}
              </span>
            </p>
            <p>
              <i class="el-icon-location-outline"></i>
              <span>地址：</span>
              <span>{{ returnInfo.address }}</span>
            </p>
          </dd>
        </dl>
        <ElButton v-loading="handleLoading" type="primary" @click="handleReserve">
          立即预约
        </ElButton>
      </section>
      <article>
        <h1>咨询师详情</h1>
        <dl>
          <dt>个人简介</dt>
          <dd v-html="returnInfo.content"></dd>
        </dl>
        <dl>
          <dt>擅长疗法</dt>
          <dd>{{ returnInfo.speciality }}</dd>
        </dl>
      </article>
      <div v-if="isPay" class="footer__content">
        <ElButton type="danger" @click="$refs.AudioDialog.initDialog(audioParams)">语 音</ElButton>
        <ElButton type="danger" @click="$refs.AudioDialog.initDialog(videoParams)">视 频</ElButton>
      </div>
    </div>
    <ScanDialog ref="ScanDialog"></ScanDialog>
    <PayDialog ref="PayDialog" @success="handlePaySuccess"></PayDialog>
    <AudioDialog ref="AudioDialog"></AudioDialog>
  </div>
</template>
<script>
import { api } from '@api'
import Header from '@components/Header'
import ScanDialog from '@components/ScanDialog'
import PayDialog from '@components/PayDialog'
import AudioDialog from '@components/AudioDialog'
import { getLocalStorage } from '@utils'
export default {
  name: 'ExpertDetails',
  components: {
    Header,
    ScanDialog,
    PayDialog,
    AudioDialog
  },
  data() {
    return {
      isPay: false,
      loading: false,
      returnInfo: {},
      orderId: null,
      handleLoading: false
    }
  },
  computed: {
    params() {
      return {
        utoken: this.$store.state.userInfo.utoken,
        stoken: this.$store.state.storeInfo.stoken
      }
    },
    infoParams() {
      return {
        utoken: this.$store.state.userInfo.utoken,
        order_id: this.orderId
      }
    },
    audioParams() {
      return {
        audio: true,
        video: false,
        id: this.orderId
      }
    },
    videoParams() {
      return {
        audio: false,
        video: true,
        id: this.orderId
      }
    }
  },
  watch: {
    $route: {
      handler(val, oldVal) {
        this.$nextTick(() => {
          this.$refs.ScanDialog.handleCancel()
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  created() {
    this.query()
  },
  methods: {
    // 获取数据
    async query() {
      this.loading = true
      const { id } = this.$route.query
      const { code, data } = await api.getExpertDetails({ id })
      if (code === 200) {
        this.returnInfo = Object.assign({}, data)
      }
      this.loading = false
    },
    // 立即预约
    handleReserve() {
      if (Object.keys(getLocalStorage('USERINFO') || {}).length === 0) {
        this.$refs.ScanDialog.initDialog()
      } else {
        this.handleOrder()
      }
    },
    // 下单
    async handleOrder() {
      try {
        this.handleLoading = true
        const { code, data } = await api.handleAddOrder({
          ...this.params,
          teacher_id: this.$route.query.id,
          service_id: this.$route.query.id
        })
        if (code === 200) {
          this.orderId = data.id
          this.$refs.PayDialog.initDialog(this.infoParams)
        }
      } catch (e) {
      } finally {
        this.handleLoading = false
      }
    },
    // 支付成功
    handlePaySuccess() {
      this.isPay = true
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/ExpertDetails.scss';
</style>
