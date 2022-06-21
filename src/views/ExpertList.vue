<template>
  <div>
    <Header></Header>
    <nav>
      <ElRow :gutter="10">
        <ElCol v-for="(item, index) in classifyList" :key="index" :span="3">
          <div
            class="class__item"
            :class="{ active: item.id === modelForm.service_id }"
            @click="handleShiftClassify(item.id)"
          >
            {{ item.type_name }}
          </div>
        </ElCol>
      </ElRow>
    </nav>
    <section v-loading="loading">
      <ElEmpty v-if="expertList.length === 0" description="没有数据哦"></ElEmpty>
      <ElCard v-for="(item, index) in expertList" :key="index" class="box-card">
        <dl>
          <dt>
            <ElImage :src="item.image">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </ElImage>
          </dt>
          <dd>
            <h1>{{ item.teacher_name }}</h1>
            <p>
              <ElButton
                v-for="(item1, index1) in item.type_list"
                :key="index1"
                type="primary"
                plain
                size="mini"
              >
                {{ item1.type_name }}
              </ElButton>
            </p>
            <p>咨询方式：{{ item.service_list.map(i => i.service_name).join('，') }}</p>
          </dd>
        </dl>
        <ElButton type="primary" @click="handleReserve(item.id)">立即预约</ElButton>
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
  </div>
</template>
<script>
import { api } from '@api'
import Header from '@components/Header'
export default {
  name: 'ExpertList',
  components: {
    Header
  },
  data() {
    return {
      loading: false,
      modelForm: {
        page: 1,
        limit: 10,
        total: 0,
        service_id: 0
      },
      expertList: [],
      classifyList: []
    }
  },
  created() {
    this.query()
    this.getOptions()
  },
  methods: {
    handleReserve(id) {
      this.$router.push({
        name: 'ExpertDetails',
        query: { id: id }
      })
    },
    handleChangeSize(e) {
      this.modelForm.limit = e
      this.query()
    },
    handleChangeCurrent(e) {
      this.modelForm.page = e
      this.query()
    },
    async query() {
      this.loading = true
      const { code, data } = await api.getExpertList(this.modelForm)
      if (code === 200) {
        this.expertList = data.data
        this.modelForm.total = data.total
      }
      this.loading = false
    },
    async getOptions() {
      const { code, data } = await api.getExpertTypeList()
      if (code === 200) {
        this.classifyList = data.data
      }
    },
    handleShiftClassify(id) {
      this.modelForm.service_id = id
      this.query()
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/expertList.scss';
</style>
