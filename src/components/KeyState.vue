<template>
  <div
    class="key-card"
    :class="[
      active ? 'bg-active' : 'bg-inactive',
      empty ? 'color-placeholder' : 'color-grey',
      { optional }
    ]"
  >
    <template v-if="empty">
      {{ placeholder }}
    </template>
    <slot>
      {{ placeholder }}
    </slot>
  </div>
</template>

<script setup>
defineProps({
  active: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Press' },
  empty: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
});
</script>


<style scoped>
.bg-active {
  background: #bbf7d0;
}
.bg-inactive {
  background: #e5e7eb;
}
.color-grey {
  color: #374151;
}
.color-placeholder {
  color: #9ca3af;
}
.key-card {
  min-width: 5ch;
  text-align: center;
  padding: 8px;
  border-radius: 4px;
  position: relative;
}
.key-card.optional::after {
  content: "(optional)";
  position: absolute;
  bottom: -40%;
  left: 0px;
  right: 0px;
  font-size: 0.6rem;
  color: lightslategrey;
}
</style>
