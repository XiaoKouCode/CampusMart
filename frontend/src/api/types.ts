export type ApiResponse<T> = { success: boolean; message: string; data: T }

export type Role = 'STUDENT' | 'ADMIN'

export type AuthResponse = { userId: number; email: string; token: string }

export type UserProfileResponse = {
  id: number
  studentNo: string
  nickname: string
  email: string
  phone: string | null
  avatarUrl: string | null
  creditScore: number
  verified: boolean
  roles: Role[]
}

export type UpdateProfileRequest = {
  nickname: string
  avatarUrl?: string | null
  phone?: string | null
}

export type ItemStatus = 'PENDING_REVIEW' | 'ONLINE' | 'OFFLINE' | 'SOLD'

export type ItemResponse = {
  id: number
  title: string
  description: string
  price: string
  conditionLevel: string
  category: string
  imageUrls: string
  status: ItemStatus
  sellerId: number
  sellerNickname: string
  sellerCredit: number
  createdAt: string
}

export type CreateItemRequest = {
  title: string
  description: string
  price: string
  conditionLevel: string
  category: string
  imageUrls: string
}

export type Page<T> = {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'FUNDS_HELD'
  | 'WAITING_SELLER_CONFIRM'
  | 'WAITING_BUYER_RECEIVE'
  | 'COMPLETED'
  | 'CANCELED'

export type OrderResponse = {
  id: number
  itemId: number
  itemTitle: string
  buyerId: number
  sellerId: number
  amount: string
  status: OrderStatus
  createdAt: string
}

export type RatingLevel = 'GOOD' | 'NEUTRAL' | 'BAD'

export type ChatMessageRequest = {
  receiverId: number
  itemId?: number | null
  content: string
}

export type ChatMessageResponse = {
  id: number
  senderId: number
  receiverId: number
  itemId: number | null
  content: string
  createdAt: string
}

export type CreateReviewRequest = {
  orderId: number
  level: RatingLevel
  content: string
}

export type CreateReportRequest = {
  targetUserId?: number | null
  targetItemId?: number | null
  reason: string
}

export type ReportStatus = 'OPEN' | 'RESOLVED' | 'REJECTED'

