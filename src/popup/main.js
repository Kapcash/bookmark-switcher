import { createApp } from 'vue'
import Popup from './Popup.vue'
import { useI18n } from '@/composables/useI18n'

import '../../assets/css/global.css'

const app = createApp(Popup)
app.config.globalProperties.i18n = useI18n()
app.mount('#app')
