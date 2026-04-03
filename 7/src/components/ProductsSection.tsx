import { useState } from 'react'
import { useStore } from '../store'
import { showToast } from './Toast'
import EditModal from './EditModal'
import type { FormStatus, ModalState } from '../types'

const API = 'https://dummyjson.com/products'

export default function ProductsSection() {
  const { products, productsLoading, productsError, setProducts } = useStore()
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [editModal, setEditModal] = useState<ModalState | null>(null)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const [updatedIds, setUpdatedIds] = useState<Set<number>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !price || parseFloat(price) <= 0) {
      setFormStatus({ type: 'error', text: 'Заполните все поля корректно.' })
      return
    }
    setSubmitting(true)
    setFormStatus({ type: 'loading', text: 'Отправка...' })
    try {
      const res = await fetch(API + '/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), price: parseFloat(price) })
      })
      if (!res.ok) throw new Error('Ошибка ' + String(res.status))
      const data = await res.json()
      setProducts(prev => [{
        id: data.id,
        title: data.title || title.trim(),
        price: data.price || parseFloat(price),
        description: data.description || '',
        category: data.category || 'новый',
        thumbnail: data.thumbnail || ''
      }, ...prev])
      setNewIds(prev => new Set([...prev, data.id]))
      setFormStatus({ type: 'success', text: `Товар #${data.id} добавлен!` })
      showToast('Товар создан (POST → 201)', 'success')
      setTitle('')
      setPrice('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      setFormStatus({ type: 'error', text: 'Ошибка: ' + msg })
      showToast('Ошибка добавления товара', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(id: number, values: Record<string, string>) {
    const res = await fetch(API + '/' + String(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: values['title'], price: parseFloat(values['price'] ?? '0') })
    })
    if (!res.ok) throw new Error('Ошибка ' + String(res.status))
    const result = await res.json()
    setProducts(prev => prev.map(p => p.id === id ? { ...p, title: result.title, price: result.price } : p))
    setUpdatedIds(prev => new Set([...prev, id]))
    showToast(`Товар #${id} обновлён (PUT → 200)`, 'success')
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить товар #' + String(id) + '?')) return
    try {
      const res = await fetch(API + '/' + String(id), { method: 'DELETE' })
      if (!res.ok) throw new Error('Ошибка ' + String(res.status))
      setDeletedIds(prev => new Set([...prev, id]))
      showToast(`Товар #${id} удалён (DELETE → 200)`, 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      showToast('Ошибка: ' + msg, 'error')
    }
  }

  function getCardClass(id: number): string {
    let cls = 'item-card'
    if (deletedIds.has(id)) cls += ' deleted'
    if (newIds.has(id)) cls += ' new-item'
    if (updatedIds.has(id)) cls += ' updated-item'
    return cls
  }

  return (
    <>
      <div className="section-header">
        <h2>Товары</h2>
        <p className="api-badge">DummyJSON - <code>dummyjson.com/products</code></p>
      </div>

      <div className="form-card">
        <h3>Добавить товар <span className="method-tag post">POST</span></h3>
        <form onSubmit={handleCreate}>
          <input type="text" placeholder="Название товара" value={title} onChange={e => setTitle(e.target.value)} required />
          <input type="number" placeholder="Цена" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
          <button type="submit" disabled={submitting}>Добавить</button>
        </form>
        {formStatus && (
          <div className="form-status">
            <span className={formStatus.type}>
              {formStatus.type === 'loading' && <span className="spinner" />}
              {formStatus.text}
            </span>
          </div>
        )}
      </div>

      <h3>Все товары <span className="method-tag get">GET</span></h3>
      <div className="items-grid">
        {productsLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-card" />)}
        {productsError && <div className="placeholder-msg error">Не удалось загрузить товары: {productsError}</div>}
        {!productsLoading && !productsError && products.length === 0 && <div className="placeholder-msg">Товаров пока нет.</div>}
        {products.map(p => (
          <div key={p.id} className={getCardClass(p.id)}>
            <div className="card-top">
              {p.thumbnail && <img className="card-thumb" src={p.thumbnail} alt={p.title} />}
              <div className="card-info">
                <span className="card-id">#{p.id} · {p.category}</span>
                <div className="card-title">{p.title}</div>
                <div className="card-price">${p.price}</div>
              </div>
            </div>
            {p.description && <div className="card-body">{p.description.substring(0, 100)}</div>}
            <div className="card-actions">
              <button className="btn-edit" onClick={() => setEditModal({
                id: p.id,
                title: 'Редактировать товар #' + String(p.id),
                fields: [
                  { name: 'title', label: 'Название', type: 'text', value: p.title },
                  { name: 'price', label: 'Цена', type: 'number', value: String(p.price) }
                ]
              })}>
                Изменить <span className="method-tag put">PUT</span>
              </button>
              <button className="btn-delete" disabled={deletedIds.has(p.id)} onClick={() => handleDelete(p.id)}>
                Удалить <span className="method-tag delete">DEL</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {editModal && (
        <EditModal
          isOpen={!!editModal}
          title={editModal.title}
          fields={editModal.fields}
          onSave={values => handleEdit(editModal.id, values)}
          onClose={() => setEditModal(null)}
        />
      )}
    </>
  )
}
