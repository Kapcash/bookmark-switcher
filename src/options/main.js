import { createApp } from 'vue'
import { useI18n } from '@/composables/useI18n'
import Settings from './SettingsSuspense.vue'

const app = createApp(Settings)

app.config.globalProperties.i18n = useI18n()

app.mount('#app')

