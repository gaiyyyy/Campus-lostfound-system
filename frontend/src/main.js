import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import logger from './utils/logger'

window.addEventListener('error', (event) => {
	logger.error('Global runtime error', event.error, {
		filename: event.filename,
		line: event.lineno,
		column: event.colno,
	})
})

const app = createApp(App)

app.config.errorHandler = (error, instance, info) => {
	const componentName =
		instance && instance.$options && instance.$options.name
			? instance.$options.name
			: 'AnonymousComponent'

	logger.error('Vue component error', error, {
		component: componentName,
		info,
	})
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')