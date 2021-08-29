<template>
  <div>
    <section>
      <ul class="list">
        <li v-for="bar in bookmarkBars" :key="bar.id" >
          <BookmarkBar :bar-id="bar.id" :name="bar.title" @remove="removeBar" />
        </li>
      </ul>
    </section>
    <section>
      <CreateBar class="" @create="addNewBar" />
    </section>
    <button v-if="isDev" @click="clear">CLEAR</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import BookmarkBar from '@/components/BookmarkBar.vue'
import CreateBar from '@/components/CreateBar.vue'
import { initState, getBookmarkBars, resetStorage } from '@/bookmarkState'
import { removeFolder } from '@/bookmarkHelper'

export default {
  name: 'BarsList',
  components: { BookmarkBar, CreateBar },
  async setup () {
    const isDev = process.env.NODE_ENV !== 'production'
    const bookmarkBars = ref([])

    function addNewBar (newBar) {
      bookmarkBars.value.push(newBar)
    }

    function removeBar (barId) {
      removeFolder(barId).then(() => {
        const barIndex = bookmarkBars.value.findIndex((bookmarkBar) => bookmarkBar.id === barId)
        bookmarkBars.value.splice(barIndex, 1)
      })
    }

    function clear () {
      if (isDev) {
        resetStorage()
      }
    }

    await initState()

    bookmarkBars.value = await getBookmarkBars()

    return { isDev, bookmarkBars, addNewBar, removeBar, clear }
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
