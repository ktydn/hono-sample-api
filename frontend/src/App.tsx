import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'https://hono-sample-api.bashi-sample-api.workers.dev'

interface Item {
  id: number
  name: string
  description: string
  createdAt: string
}

function getInitialTheme(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dark, setDark] = useState(getInitialTheme)

  // Apply theme attribute on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/items`)
      if (!res.ok) throw new Error('Failed to fetch items')
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = async () => {
    if (!name.trim()) return
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) throw new Error('Failed to add item')
      setName('')
      setDescription('')
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error adding item')
    }
  }

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error deleting item')
    }
  }

  const startEdit = (item: Item) => {
    setEditing(item.id)
    setEditName(item.name)
    setEditDescription(item.description)
  }

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription }),
      })
      if (!res.ok) throw new Error('Failed to update item')
      setEditing(null)
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error updating item')
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditName('')
    setEditDescription('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem()
  }

  // Format date for display
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="app-wrapper">
      {/* ── Header ─────────────────── */}
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">Hono Sample API</h1>
          <p className="header-subtitle">
            API: <code>{API_BASE}</code>
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '\u2600\uFE0F' : '\u{1F319}'}
        </button>
      </header>

      {/* ── Error ──────────────────── */}
      {error && (
        <div className="error-banner" onClick={() => setError('')} role="alert">
          <span>&#x26A0;</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Add Form ───────────────── */}
      <section className="card">
        <div className="card-header">
          <span className="card-icon">+</span>
          <h2>Add New Item</h2>
        </div>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="item-name">Name</label>
            <input
              id="item-name"
              className="input-field"
              type="text"
              placeholder="Enter item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input-group">
            <label htmlFor="item-desc">Description (optional)</label>
            <input
              id="item-desc"
              className="input-field"
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary btn-full" onClick={addItem}>
              Add Item
            </button>
          </div>
        </div>
      </section>

      {/* ── Items List ─────────────── */}
      <section className="card">
        <div className="items-header">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <span className="card-icon">&#x2630;</span>
            <h2>Items</h2>
          </div>
          {!loading && (
            <span className="items-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Loading items&hellip;</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">&#x1F4E6;</span>
            <span className="empty-text">No items found</span>
          </div>
        ) : (
          <div className="item-list">
            {items.map((item) => (
              <div
                key={item.id}
                className={`item-card${editing === item.id ? ' editing' : ''}`}
              >
                <span className="item-id-badge">#{item.id}</span>

                <div className="item-body">
                  {editing === item.id ? (
                    <div className="edit-fields">
                      <input
                        className="input-field"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                      />
                      <input
                        className="input-field"
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="item-name">{item.name}</div>
                      <div className="item-description">
                        {item.description || '\u2014'}
                      </div>
                      {item.createdAt && (
                        <div className="item-meta">{formatDate(item.createdAt)}</div>
                      )}
                    </>
                  )}
                </div>

                <div className="item-actions">
                  {editing === item.id ? (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => saveEdit(item.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App