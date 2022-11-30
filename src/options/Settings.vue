<template>
  <div>
    <HotkeysInput v-model="hotkeys"/>
    <button @click="updateShortcut" :disabled="!changedShortcut" >{{ i18n.savePreferences }}</button>
    <span :class="color">{{ msg }}</span>
  </div>
</template>

<script>
import HotkeysInput from '@/components/HotkeysInput.vue'
import { NEXT_BAR_COMMAND_NAME } from '@/constants'

export default {
  name: 'Settings',
  components: { HotkeysInput },
  data () {
    return {
      hotkeys: '',
      msg: '',
      changedShortcut: false,
    }
  },
  async created () {
    const cmds = await browser.commands.getAll()

    const nextBarCmd = cmds.find(cmd => cmd.name === NEXT_BAR_COMMAND_NAME)
    this.hotkeys = nextBarCmd?.shortcut || ''
    this.changedShortcut = false
  },
  watch: {
    hotkeys (newHotkeys, oldHotkeys) {
      if (oldHotkeys) {
        this.changedShortcut = true
      }
    },
  },
  methods: {
    updateShortcut () {
      browser.commands.update({
        name: NEXT_BAR_COMMAND_NAME,
        shortcut: this.hotkeys,
      }).then(() => {
        this.color = 'success'
        this.msg = this.i18n.shortcutSuccess
        this.changedShortcut = false
      }).catch(() => {
        this.color = 'error'
        this.msg = this.i18n.shortcutError
      })
    },
  },
}
</script>

<style>
.success {
  color: green;
}
.error {
  color: red;
}
</style>
