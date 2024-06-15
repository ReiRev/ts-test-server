import exp from 'constants'
import { Request } from 'express'
import { mock } from 'node:test'

import { getUser, getUsers } from './users'

const mockRedisGet = jest.fn()
const mockRedisScanStream = jest.fn()

jest.mock('../lib/redis', () => {
  return {
    getClient: jest.fn().mockImplementation(() => {
      return {
        get: mockRedisGet,
        scanStream: mockRedisScanStream,
      }
    }),
  }
})

beforeEach(() => {
  mockRedisGet.mockClear()
  mockRedisScanStream.mockClear()
})

test('getUser', async () => {
  mockRedisGet.mockResolvedValue(JSON.stringify({ id: 1, name: 'alpha' }))
  const reqMock = { params: { id: 1 } } as any as Request<{ id: string }>
  const res = await getUser(reqMock)

  expect(res.id).toStrictEqual(1)
  expect(res.name).toStrictEqual('alpha')
  expect(mockRedisGet).toHaveBeenCalledTimes(1)

  const [arg1] = mockRedisGet.mock.calls[0]
  expect(arg1).toStrictEqual('users:1')
})

test('getUsers', async () => {
  const streamMock = {
    async *[Symbol.asyncIterator]() {
      yield ['users:1', 'users:2']
      yield ['users:3', 'users:4']
    },
  }

  mockRedisScanStream.mockReturnValueOnce(streamMock)
  mockRedisGet.mockImplementation((key: string) => {
    switch (key) {
      case 'users:1':
        return JSON.stringify({ id: 1, name: 'alpha' })
      case 'users:2':
        return JSON.stringify({ id: 2, name: 'bravo' })
      case 'users:3':
        return JSON.stringify({ id: 3, name: 'charlie' })
      case 'users:4':
        return JSON.stringify({ id: 4, name: 'delta' })
      default:
        return null
    }
  })

  const reqMock = {} as Request
  const res = await getUsers(reqMock)

  expect(mockRedisGet).toHaveBeenCalledTimes(4)
  expect(res.users.length).toStrictEqual(4)
  expect(res.users).toStrictEqual([
    { id: 1, name: 'alpha' },
    { id: 2, name: 'bravo' },
    { id: 3, name: 'charlie' },
    { id: 4, name: 'delta' },
  ])
})

test('getUser failed', async () => {
  expect.assertions(2)

  mockRedisGet.mockRejectedValue(new Error('something went wrong'))
  const reqMock = { params: { id: 1 } } as any as Request<{ id: string }>

  try {
    await getUser(reqMock)
  } catch (err) {
    expect((err as Error).message).toStrictEqual('something went wrong')
    expect(err instanceof Error).toStrictEqual(true)
  }
})
