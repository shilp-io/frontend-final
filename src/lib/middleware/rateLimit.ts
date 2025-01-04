import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000 // 1 minute
}

// In-memory store for rate limiting
// In production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { maxRequests, windowMs } = { ...defaultConfig, ...config }

  return async function rateLimitMiddleware(
    request: NextRequest,
    response: NextResponse
  ) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`
    
    const currentLimit = rateLimitStore.get(key)
    
    if (!currentLimit) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return response
    }

    if (now > currentLimit.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return response
    }

    if (currentLimit.count >= maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((currentLimit.resetTime - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((currentLimit.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    rateLimitStore.set(key, {
      count: currentLimit.count + 1,
      resetTime: currentLimit.resetTime
    })

    return response
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute 