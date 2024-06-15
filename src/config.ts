import dotenv from 'dotenv'
import { RedisOptions } from 'ioredis'

dotenv.config()

export const redisConfig: RedisOptions = {
  port: 6379,
  host: 'redis',
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false,
}
