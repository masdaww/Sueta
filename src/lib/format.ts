export const formatPrice = (n: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export const orderStatusLabel: Record<string, string> = {
  created: 'Оформлен',
  paid: 'Оплачен',
  packed: 'Собран',
  shipped: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export const orderStatusEmoji: Record<string, string> = {
  created: '📝',
  paid: '💳',
  packed: '📦',
  shipped: '🚚',
  delivered: '🎉',
  cancelled: '❌',
}

export function pluralizeRu(n: number, forms: [string, string, string]) {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}
