import { ref } from 'vue'
import en from './en.js'
import ru from './ru.js'
import uk from './uk.js'

export const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uk', label: 'UA' },
]

const VALID = LOCALES.map((l) => l.code)
const stored = localStorage.getItem('locale')
export const locale = ref(VALID.includes(stored) ? stored : 'en')

const messages = { en, ru, uk }

export function t(key) {
  return messages[locale.value]?.[key] ?? messages.en[key] ?? key
}

export function setLocale(code) {
  if (!VALID.includes(code) || code === locale.value) return
  localStorage.setItem('locale', code)
  locale.value = code
  window.location.reload()
}
