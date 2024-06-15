import Redis from 'ioredis'

import { redisConfig } from '../config'

let redis: Redis | null = null

export const getClient = () => {
  return redis
}

export const connect = () => {
  if (!redis) {
    redis = new Redis(redisConfig)
  }
  return redis
}

export const init = async () => {
  await Promise.all([
    redis?.set('users:1', JSON.stringify({ id: 1, name: 'alpha' })),
    redis?.set('users:2', JSON.stringify({ id: 2, name: 'bravo' })),
    redis?.set('users:3', JSON.stringify({ id: 3, name: 'charlie' })),
    redis?.set('users:4', JSON.stringify({ id: 4, name: 'delta' })),
  ])
}

export default {
  getClient,
  connect,
  init,
}
