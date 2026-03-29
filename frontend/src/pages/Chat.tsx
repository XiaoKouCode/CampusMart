import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useSearchParams, useParams } from 'react-router-dom'
import { apiRequest } from '@/api/http'
import type { ChatMessageResponse } from '@/api/types'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'

type ConnState = 'disconnected' | 'connecting' | 'connected'

export default function Chat() {
  const { peerUserId } = useParams()
  const [params] = useSearchParams()
  const itemIdParam = params.get('itemId')
  const itemId = itemIdParam ? Number(itemIdParam) : null

  const token = useAuthStore((s) => s.token)
  const me = useAuthStore((s) => s.me)

  const peerId = Number(peerUserId)
  const [list, setList] = useState<ChatMessageResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [conn, setConn] = useState<ConnState>('disconnected')

  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const wsUrl = useMemo(() => {
    const t = token ? encodeURIComponent(token) : ''
    return `/ws/chat?token=${t}`
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [list.length])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    apiRequest<ChatMessageResponse[]>(`/api/chat/history/${peerId}`, { token })
      .then((d) => {
        if (!alive) return
        setList(d)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [peerId, token])

  useEffect(() => {
    if (!token) return
    setConn('connecting')
    const client = new Client({
      reconnectDelay: 1500,
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      onConnect: () => {
        setConn('connected')
        client.subscribe('/user/queue/messages', (msg) => {
          try {
            const body = JSON.parse(msg.body) as ChatMessageResponse
            setList((prev) => {
              const exists = prev.some((m) => m.id === body.id)
              if (exists) return prev
              const related =
                (body.senderId === peerId && body.receiverId === me?.id) ||
                (body.senderId === me?.id && body.receiverId === peerId)
              if (!related) return prev
              return [...prev, body]
            })
          } catch {
            return
          }
        })
      },
      onWebSocketClose: () => setConn('disconnected'),
      onStompError: () => setConn('disconnected'),
    })

    client.activate()
    clientRef.current = client
    return () => {
      clientRef.current?.deactivate()
      clientRef.current = null
      setConn('disconnected')
    }
  }, [token, wsUrl, peerId, me?.id])

  async function sendByRest(content: string) {
    const saved = await apiRequest<ChatMessageResponse>('/api/chat/send', {
      method: 'POST',
      token,
      body: { receiverId: peerId, itemId, content },
    })
    setList((prev) => [...prev, saved])
  }

  function sendByWs(content: string) {
    const c = clientRef.current
    if (!c || conn !== 'connected') return false
    c.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ receiverId: peerId, itemId, content }),
    })
    return true
  }

  return (
    <div className="grid grid-rows-[auto,1fr,auto] overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">与用户 #{peerId} 的聊天</div>
          <div className="mt-1 text-xs text-zinc-500">连接状态：{conn === 'connected' ? '实时' : conn === 'connecting' ? '连接中' : '未连接'}（REST 始终可用）</div>
        </div>
      </div>

      <div className="h-[calc(100vh-220px)] overflow-y-auto px-4 py-4">
        {loading ? <div className="h-20 animate-pulse rounded-lg bg-zinc-100" /> : null}
        {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <div className="space-y-3">
          {list.map((m) => {
            const mine = m.senderId === me?.id
            return (
              <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    mine
                      ? 'max-w-[70%] rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white'
                      : 'max-w-[70%] rounded-xl bg-zinc-100 px-4 py-2 text-sm text-zinc-900'
                  }
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div className={mine ? 'mt-1 text-right text-xs text-zinc-200' : 'mt-1 text-right text-xs text-zinc-500'}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-zinc-200 p-4">
        <div className="flex gap-2">
          <Textarea
            full
            className="min-h-10"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const content = text.trim()
                if (!content) return
                setText('')
                const ok = sendByWs(content)
                if (!ok) {
                  sendByRest(content).catch(() => {})
                }
              }
            }}
          />
          <Button
            onClick={() => {
              const content = text.trim()
              if (!content) return
              setText('')
              const ok = sendByWs(content)
              if (!ok) {
                sendByRest(content).catch(() => {})
              }
            }}
          >
            <Send className="h-4 w-4" />
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}

