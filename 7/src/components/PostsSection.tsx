import { useState } from 'react'
import { useStore } from '../store'
import { showToast } from './Toast'
import EditModal from './EditModal'
import type { FormStatus, ModalState } from '../types'

const API = 'https://jsonplaceholder.typicode.com/posts'

export default function PostsSection() {
  const { posts, postsLoading, postsError, setPosts } = useStore()
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editModal, setEditModal] = useState<ModalState | null>(null)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const [updatedIds, setUpdatedIds] = useState<Set<number>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setFormStatus({ type: 'error', text: 'Заполните все поля.' })
      return
    }
    setSubmitting(true)
    setFormStatus({ type: 'loading', text: 'Отправка...' })
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), userId: 1 })
      })
      if (!res.ok) throw new Error('Ошибка ' + String(res.status))
      const data = await res.json()
      setPosts(prev => [data, ...prev])
      setNewIds(prev => new Set([...prev, data.id]))
      setFormStatus({ type: 'success', text: `Пост #${data.id} создан!` })
      showToast('Пост создан (POST → 201)', 'success')
      setTitle('')
      setBody('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      setFormStatus({ type: 'error', text: 'Ошибка: ' + msg })
      showToast('Ошибка создания поста', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(id: number, values: Record<string, string>) {
    const res = await fetch(API + '/' + String(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: values['title'], body: values['body'], userId: 1 })
    })
    if (!res.ok) throw new Error('Ошибка ' + String(res.status))
    const result = await res.json()
    setPosts(prev => prev.map(p => p.id === id ? { ...p, title: result.title, body: result.body } : p))
    setUpdatedIds(prev => new Set([...prev, id]))
    showToast(`Пост #${id} обновлён (PUT → 200)`, 'success')
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить пост #' + String(id) + '?')) return
    try {
      const res = await fetch(API + '/' + String(id), { method: 'DELETE' })
      if (!res.ok) throw new Error('Ошибка ' + String(res.status))
      setDeletedIds(prev => new Set([...prev, id]))
      showToast(`Пост #${id} удалён (DELETE → 200)`, 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      showToast('Ошибка удаления: ' + msg, 'error')
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
        <h2>Посты</h2>
        <p className="api-badge">JSONPlaceholder - <code>jsonplaceholder.typicode.com/posts</code></p>
      </div>

      <div className="form-card">
        <h3>Добавить пост <span className="method-tag post">POST</span></h3>
        <form onSubmit={handleCreate}>
          <input type="text" placeholder="Заголовок" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea placeholder="Текст поста..." value={body} onChange={e => setBody(e.target.value)} required />
          <button type="submit" disabled={submitting}>Отправить</button>
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

      <h3>Все посты <span className="method-tag get">GET</span></h3>
      <div className="items-grid">
        {postsLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-card" />)}
        {postsError && <div className="placeholder-msg error">Не удалось загрузить посты: {postsError}</div>}
        {!postsLoading && !postsError && posts.length === 0 && <div className="placeholder-msg">Постов пока нет.</div>}
        {posts.map(post => (
          <div key={post.id} className={getCardClass(post.id)}>
            <span className="card-id">#{post.id}</span>
            <div className="card-title">{post.title}</div>
            <div className="card-body">{post.body.substring(0, 120)}...</div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => setEditModal({
                id: post.id,
                title: 'Редактировать пост #' + String(post.id),
                fields: [
                  { name: 'title', label: 'Заголовок', type: 'text', value: post.title },
                  { name: 'body', label: 'Текст', type: 'textarea', value: post.body }
                ]
              })}>
                Изменить <span className="method-tag put">PUT</span>
              </button>
              <button className="btn-delete" disabled={deletedIds.has(post.id)} onClick={() => handleDelete(post.id)}>
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
