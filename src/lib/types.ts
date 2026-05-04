export type Category = {
  id: string
  name: string
  emoji: string
  tagline: string
}

export type Product = {
  id: string
  title: string
  brand: string
  description: string
  price: number
  oldPrice?: number
  rating: number
  reviewsCount: number
  categoryId: string
  image: string
  badges: string[]
  stock: number
  createdAt: string
  funFact?: string
}

export type Review = {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  text: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export type CartItem = {
  productId: string
  qty: number
}

export type DeliveryOption = {
  id: string
  name: string
  description: string
  price: number
  eta: string
  emoji: string
}

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderItem = {
  productId: string
  title: string
  price: number
  qty: number
  image: string
}

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  delivery: DeliveryOption
  address: string
  payment: 'card' | 'sbp' | 'cash' | 'sueta-coins'
  status: OrderStatus
  createdAt: string
  history: { status: OrderStatus; at: string }[]
}

export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'admin'
  blocked: boolean
  createdAt: string
  avatar: string
  address?: string
  bio?: string
}

export type Notification = {
  id: string
  type: 'success' | 'info' | 'warn' | 'error'
  title: string
  message?: string
}
