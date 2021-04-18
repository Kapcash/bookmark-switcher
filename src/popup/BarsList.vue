<template>
  <div>
    <section>
      <ul class="list">
        <li>
          <bookmark-bar v-for="bar in bookmarkBars" :key="bar.id" :bar-id="bar.id" :name="bar.title" @remove="removeBar" />
        </li>
      </ul>
    </section>
    <section>
      <create-bar class="" @create="addNewBar" />
    </section>
    <!-- <button @click="clear">CLEAR</button> -->
  </div>
</template>

<script>
import { ref } from 'vue'
import BookmarkBar from '@/components/BookmarkBar.vue'
import CreateBar from '@/components/CreateBar.vue'
import { getBookmarkBars, removeFolder } from '@/components/bookmarkHelper'

export default {
  name: 'BarsList',
  components: { BookmarkBar, CreateBar },
  async setup () {
    const bookmarkBars = ref([])
    bookmarkBars.value = await getBookmarkBars()

    return { bookmarkBars }
  },
  methods: {
    addNewBar (newBar) {
      this.bookmarkBars.push(newBar)
    },
    removeBar (barId) {
      removeFolder(barId).then(() => {
        const barIndex = this.bookmarkBars.findIndex((bookmarkBar) => bookmarkBar.id === barId)
        this.bookmarkBars.splice(barIndex, 1)
      })
    },
    clear () {
      browser.storage.local.clear()
    }
  }
}
</script>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

section + section {
  border-top: 1px solid #222;
  padding-top: 1px;
  margin-top: 1px;
}
</style>
