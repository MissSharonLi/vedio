<template>
  <div>
    <Header></Header>
    <section>
      <ElCard v-for="(item, index) in expertList" :key="index">
        <dl>
          <dt>订单号：{{ item.order_no }}</dt>
          <dd>用户：{{ item.teacher_name }}</dd>
          <dd>下单时间：{{ item.completetime_text }}</dd>
          <dd>支付金额：￥{{ item.price }}</dd>
          <dd>订单状态：￥{{ item.status_text }}</dd>
          <dd>
            <ElButton plain :disabled="item.status !== 2" @click="handleCompelte(item.id)">
              {{ item.status === 2 ? '完成订单' : item.status_text }}
            </ElButton>
            <ElButton
              v-if="item.status === 2"
              type="primary"
              @click="$refs.AudioDialog.initDialog({ id: item.id, ...videoParams })"
            >
              进入咨询
            </ElButton>
          </dd>
        </dl>
      </ElCard>
    </section>
    <footer>
      <ElPagination
        v-if="expertList.length > 0"
        center
        background
        layout="prev, pager, next"
        :page-size="modelForm.limit"
        :current-page="modelForm.page"
        :total="modelForm.total"
        @size-change="handleChangeSize"
        @current-change="handleChangeCurrent"
      ></ElPagination>
    </footer>
    <AudioDialog ref="AudioDialog"></AudioDialog>
  </div>
</template>
<script>
import { api } from '@api'
import Header from '@components/Header'
import AudioDialog from '@components/AudioDialog'
export default {
  name: 'ExpertServiceCenter',
  components: {
    Header,
    AudioDialog
  },
  data() {
    return {
      modelForm: {
        page: 1,
        limit: 10,
        total: 0,
        type: 0,
        utoken: this.$store.state.userInfo.utoken
      },
      expertList: []
    }
  },
  computed: {
    videoParams() {
      return {
        audio: false,
        video: true
      }
    }
  },
  created() {
    this.query()
  },
  methods: {
    async query() {
      const { code, data } = await api.getOrderList(this.modelForm)
      if (code === 200) {
        this.expertList = data.data
        this.modelForm.total = data.total
      }
    },
    handleChangeSize(e) {
      this.modelForm.limit = e
      this.query()
    },
    handleChangeCurrent(e) {
      this.modelForm.page = e
      this.query()
    },
    // 完成订单
    async handleCompelte(id) {
      const params = { utoken: this.$store.state.userInfo.utoken, id }
      const { code } = await api.handleCompelte(params)
      if (code === 200) {
        this.$message.success('完成订单成功')
        this.query()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/expertorCenter.scss';
</style>
