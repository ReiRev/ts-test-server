import cluster from 'cluster'
import express from 'express'
import { Request, Response, NextFunction } from 'express'
import path from 'path'

import { getUsers, getUser } from './handlers/users'
import redis from './lib/redis'

const app = express()

app.set('view enghine', 'ejs')

app.get('/', (req, res) => {
  // res.status(200).send('Hello World!\n')
  res.render(path.join(__dirname, 'views/index.ejs'))
})

app.get('/users/:id', async (req, res) => {
  try {
    const user = await getUser(req)
    res.status(200).send(user)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/users', async (req, res) => {
  try {
    const locals = await getUsers(req)
    res.render(path.join(__dirname, 'views', 'user.ejs'), locals)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

app.use('/static', express.static(path.join(__dirname, 'public')))

// Need to explicitly define the type of arguments in the error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  res.status(500).send('Internal Server Error')
})

if (cluster.isPrimary) {
  for (let i = 0; i < 4; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  redis
    .connect()
    .once('ready', async () => {
      try {
        await redis.init()
        app.listen(3000, () => {
          console.log('start listening')
        })
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    })
    .on('error', (err) => {
      console.error(err)
      process.exit(1)
    })
}
