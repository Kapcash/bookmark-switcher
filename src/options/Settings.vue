<template>
  <div>
    <h2>{{ i18n.updateHotkeys }}</h2>

    <div class="shortcut-form">
      <ShortcutInput
        v-model="hotkeys"
        class="shortcut-input"
      />

      <div class="column">
        <div class="current-shortcut">
          {{ i18n.currentHotkey }}
          <KeyState class="hotkey">
            {{ currentHotkeyString }}
          </KeyState>
        </div>

        <button
          class="save"
          :disabled="!changedShortcut"
          @click="updateShortcut"
        >
          {{ i18n.savePreferences }}
        </button>
        <span :class="color">{{ msg }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import ShortcutInput from '@/components/ShortcutInput.vue';
import KeyState from '@/components/KeyState.vue';
import { NEXT_BAR_COMMAND_NAME } from '@/constants'

export default {
  name: 'Settings',
  components: { ShortcutInput, KeyState },
  data () {
    return {
      hotkeys: [],
      msg: '',
      changedShortcut: false,
      color: '',
    }
  },
  computed: {
    currentHotkeyString() {
      return this.hotkeys.map(key => key[0].toUpperCase() + key.slice(1)).join(' + ')
    },
  },
  watch: {
    hotkeys (newHotkeys, oldHotkeys) {
      if (oldHotkeys?.length > 0) {
        this.changedShortcut = true
        this.msg = '';
      }
    },
  },
  async created () {
    const cmds = await browser.commands.getAll()

    const nextBarCmd = cmds.find(cmd => cmd.name === NEXT_BAR_COMMAND_NAME)
    this.hotkeys = nextBarCmd?.shortcut.split('+') || []
    this.changedShortcut = false
  },
  methods: {
    async updateShortcut () {
      try {
        await browser.commands.update({
          name: NEXT_BAR_COMMAND_NAME,
          shortcut: this.hotkeys.map(key => key[0].toUpperCase() + key.slice(1)).join('+'),
        })
        this.color = 'success'
        this.msg = this.i18n.shortcutSuccess
        this.changedShortcut = false
      } catch (error) {
        console.error("Update shortcut error:", error)
        this.color = 'error'
        this.msg = this.i18n.shortcutError
      }
    },
  },
}
</script>

<style>
body {
  background: #ffffff;
  min-height: 280px;
}
@media (prefers-color-scheme: dark) {
  body {
    background: #23222b;
    color: #ffffff;
  }
}
</style>

<style scoped>
.shortcut-form {
  display: flex;
  gap: 24px;
}
.column {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  gap: 16px;
}
.current-shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.current-shortcut .hotkey {
  background-color: beige;
  margin: 8px;
}
button.save {
  margin: 8px 0;
  padding: 4px 10px;
  border-radius: 6px;
  background-color: #34ac47;
  border: 1px solid beige;
  font-size: 1.25rem;
  color: inherit;
  cursor: pointer;
}
button.save:hover {
  background-color: #44c85a;
}
button.save:disabled {
  background-color: gray;
  color: lightgray;
  cursor: not-allowed;
}
.success {
  color: green;
}
.error {
  color: #be3232;
}
</style>
