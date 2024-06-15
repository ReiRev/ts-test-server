import { Request } from 'express'

import redis from '../lib/redis'

export const getUser = async (
  req: Request<{
    id: string
  }>,
) => {
  const redisClient = redis.getClient()
  if (!redisClient) {
    throw new Error('Redis client not found')
  }
  const key = `users:${req.params.id}`
  const val = await redisClient.get(key)
  if (!val) {
    throw new Error('User not found')
  }
  const user = JSON.parse(val)
  return user
}

export const getUsers = async (req: Request) => {
  const redisClient = redis.getClient()
  if (!redisClient) {
    throw new Error('Redis client not found')
  }
  const stream = redisClient.scanStream({
    match: 'users:*',
    count: 2,
  })
  if (!stream) throw new Error('Stream not found')
  const users = []
  for await (const resultKeys of stream) {
    for (const key of resultKeys) {
      const val = await redisClient.get(key)
      if (val === null) continue
      users.push(JSON.parse(val))
    }
  }
  return { users }
}
