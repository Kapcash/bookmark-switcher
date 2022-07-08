<template>
  <div>
    <section>
      <ul class="list">
        <li v-for="bar in bookmarkBars" :key="bar.id" >
          <BookmarkBarView
            :name="[bar.icon, bar.title].filter(Boolean).join(' ')"
            :disabled="bar.id === currentBarId"
            @select="$emit('switch', bar)"
            @edit="$emit('edit', bar)"
          />
        </li>
      </ul>
    </section>
    <section>
      <CreateBar @create="$emit('create', $event)" />
    </section>
  </div>
</template>

<script>
import BookmarkBarView from '@/components/BookmarkBarView.vue'
import CreateBar from '@/components/CreateBar.vue'

export default {
  name: 'BarsList',
  components: { BookmarkBarView, CreateBar },
  props: {
    bookmarkBars: { type: Array, required: true },
    currentBarId: { type: String, required: true },
  },
  emits: ['switch', 'edit', 'create', 'remove'],
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
</style>
