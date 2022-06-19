<template>
  <div>
    <section>
      <ul class="list">
        <li v-for="bar in bookmarkBars" :key="bar.id" >
          <BookmarkBar
            :bar-id="bar.id"
            :name="bar.title"
            :active="bar === currentBar"
            @select="switchBar"
            @remove="deleteBar"
          />
        </li>
      </ul>
    </section>
    <section>
      <CreateBar @create="createBar" />
    </section>
  </div>
</template>

<script>
import BookmarkBar from '@/components/BookmarkBar.vue'
import CreateBar from '@/components/CreateBar.vue'
import { useBookmarkBars } from '@/composables/useBookmarks'

export default {
  name: 'BarsList',
  components: { BookmarkBar, CreateBar },
  async setup () {
    const { bars: bookmarkBars, currentBar, createBar, deleteBar } = await useBookmarkBars()

    function switchBar (barId) {
      const bookmarkBar = bookmarkBars.value.find(bar => bar.id === barId)
      currentBar.value = bookmarkBar
    }

    return { currentBar, bookmarkBars, createBar, deleteBar, switchBar }
  },
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
