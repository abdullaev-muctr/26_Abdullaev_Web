import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Post, User, Product } from './types'

interface StoreState {
  posts: Post[]
  users: User[]
  products: Product[]
  postsLoading: boolean
  usersLoading: boolean
  productsLoading: boolean
  postsError: string | null
  usersError: string | null
  productsError: string | null
  setPosts: (updater: (prev: Post[]) => Post[]) => void
  setUsers: (updater: (prev: User[]) => User[]) => void
  setProducts: (updater: (prev: Product[]) => Product[]) => void
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=12')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка ' + String(res.status))
        return res.json() as Promise<Post[]>
      })
      .then(data => setPosts(data))
      .catch((err: Error) => setPostsError(err.message))
      .finally(() => setPostsLoading(false))

    fetch('https://dummyjson.com/users?limit=12')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка ' + String(res.status))
        return res.json() as Promise<{ users: User[] }>
      })
      .then(json => setUsers(json.users))
      .catch((err: Error) => setUsersError(err.message))
      .finally(() => setUsersLoading(false))

    fetch('https://dummyjson.com/products?limit=12')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка ' + String(res.status))
        return res.json() as Promise<{ products: Product[] }>
      })
      .then(json => setProducts(json.products))
      .catch((err: Error) => setProductsError(err.message))
      .finally(() => setProductsLoading(false))
  }, [])

  const updatePosts = (updater: (prev: Post[]) => Post[]) => setPosts(updater)
  const updateUsers = (updater: (prev: User[]) => User[]) => setUsers(updater)
  const updateProducts = (updater: (prev: Product[]) => Product[]) => setProducts(updater)

  return (
    <StoreContext.Provider value={{
      posts, users, products,
      postsLoading, usersLoading, productsLoading,
      postsError, usersError, productsError,
      setPosts: updatePosts,
      setUsers: updateUsers,
      setProducts: updateProducts
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
