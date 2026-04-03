export interface Post {
  id: number
  title: string
  body: string
  userId: number
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  image: string
}

export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  thumbnail: string
}

export interface EditField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number'
  value: string
}

export interface ModalState {
  id: number
  title: string
  fields: EditField[]
}

export interface FormStatus {
  type: 'loading' | 'success' | 'error'
  text: string
}
