import { Hono } from 'hono'

// インメモリデータストア（サンプル用）
interface Item {
  id: number
  name: string
  description: string
  createdAt: string
}

const app = new Hono()

// ===== サンプルデータ =====
let items: Item[] = [
  { id: 1, name: 'サンプルアイテム1', description: 'これはサンプルです', createdAt: new Date().toISOString() },
  { id: 2, name: 'サンプルアイテム2', description: 'Honoを使ったAPIのテスト', createdAt: new Date().toISOString() },
]

let nextId = 3

// ===== ルート =====
app.get('/', (c) => {
  return c.json({ message: 'Hono Sample API', version: '1.0.0' })
})

// ===== GET /items - 全アイテム取得 =====
app.get('/items', (c) => {
  return c.json(items)
})

// ===== GET /items/:id - 特定アイテム取得 =====
app.get('/items/:id', (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const item = items.find((i) => i.id === id)

  if (!item) {
    return c.json({ error: 'アイテムが見つかりません' }, 404)
  }

  return c.json(item)
})

// ===== POST /items - 新規アイテム作成 =====
app.post('/items', async (c) => {
  const body = await c.req.json<{ name: string; description: string }>()

  if (!body.name) {
    return c.json({ error: 'nameは必須です' }, 400)
  }

  const newItem: Item = {
    id: nextId++,
    name: body.name,
    description: body.description || '',
    createdAt: new Date().toISOString(),
  }

  items.push(newItem)
  return c.json(newItem, 201)
})

// ===== PUT /items/:id - アイテム更新 =====
app.put('/items/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const itemIndex = items.findIndex((i) => i.id === id)

  if (itemIndex === -1) {
    return c.json({ error: 'アイテムが見つかりません' }, 404)
  }

  const body = await c.req.json<{ name?: string; description?: string }>()

  items[itemIndex] = {
    ...items[itemIndex],
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
  }

  return c.json(items[itemIndex])
})

// ===== DELETE /items/:id - アイテム削除 =====
app.delete('/items/:id', (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const itemIndex = items.findIndex((i) => i.id === id)

  if (itemIndex === -1) {
    return c.json({ error: 'アイテムが見つかりません' }, 404)
  }

  items.splice(itemIndex, 1)
  return c.json({ message: 'アイテムを削除しました' })
})

// ===== Cloudflare Workers 用エクスポート =====
export default app