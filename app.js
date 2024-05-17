const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const date_fns = require('date-fns')
const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const app = express()
app.use(express.json())
const path = require('path')
let db = null
const dbpath = path.join(__dirname, 'todoApplication.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running')
    })
  } catch (e) {
    console.log(`DB error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const convertToObject = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  }
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasPriorityAndStatusProperty = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasCategoryAndStatusProperty = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}

const hasTodoProperty = requestQuery => {
  return requestQuery.todo !== undefined
}

const hasDueDateProperty = requestQuery => {
  return requestQuery.dueDate !== undefined
}

app.get('/todos/', async (request, response) => {
  const {search_q, priority, status, category} = request.query
  switch (true) {
    case hasStatusProperty(request.query):
      if (status !== 'TO DO' && status !== 'IN PROGRESS' && status !== 'DONE') {
        response.status(400)
        response.send('Invalid Todo Status')
      } else {
        const query = `select * from todo where status="${status}"`
        const result = await db.all(query)
        response.send(result.map(eachObject => convertToObject(eachObject)))
      }
      break
    case hasPriorityProperty(request.query):
      if (priority !== 'HIGH' && priority !== 'MEDIUM' && priority !== 'LOW') {
        response.status(400)
        response.send('Invalid Todo Priority')
      } else {
        const query = `select * from todo where priority="${priority}"`
        const result = await db.all(query)
        response.send(result.map(eachObject => convertToObject(eachObject)))
      }
      break
    case hasPriorityAndStatusProperty(request.query):
      if (priority !== 'HIGH' && priority !== 'MEDIUM' && priority !== 'LOW') {
        response.status(400)
        response.send('Invalid Todo Priority')
      } else {
        if (
          status !== 'TO DO' &&
          status !== 'IN PROGRESS' &&
          status !== 'DONE'
        ) {
          response.status(400)
          response.send('Invalid Todo Status')
        } else {
          const query = `select * from todo where status="${status}",priority="${priority}"`
          const result = await db.all(query)
          response.send(result.map(eachObject => convertToObject(eachObject)))
        }
      }
      break
    case hasSearchProperty(request.query):
      const query = `select * from todo where todo like "%${search_q}%"`
      const result = await db.all(query)
      response.send(result.map(eachObject => convertToObject(eachObject)))
      break
    case hasCategoryAndStatusProperty(request.query):
      if (
        category !== 'WORK' &&
        category !== 'HOME' &&
        category !== 'LEARNING'
      ) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else {
        if (
          status !== 'TO DO' &&
          status !== 'IN PROGRESS' &&
          status !== 'DONE'
        ) {
          response.status(400)
          response.send('Invalid Todo Status')
        } else {
          const query = `select * from todo where status="${status}",category="${category}"`
          const result = await db.all(query)
          response.send(result.map(eachObject => convertToObject(eachObject)))
        }
      }
      break
    case hasCategoryProperty(request.query):
      if (
        category !== 'WORK' &&
        category !== 'HOME' &&
        category !== 'LEARNING'
      ) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else {
        const query = `select * from todo where category="${category}"`
        const result = await db.all(query)
        response.send(result.map(eachObject => convertToObject(eachObject)))
      }
      break
    case hasCategoryAndPriority(request.query):
      if (
        category !== 'WORK' &&
        category !== 'HOME' &&
        category !== 'LEARNING'
      ) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else {
        if (
          priority !== 'HIGH' &&
          priority !== 'MEDIUM' &&
          priority !== 'LOW'
        ) {
          response.status(400)
          response.send('Invalid Todo Priority')
        } else {
          const query = `select * from todo where category="${category}",priority="${priority}"`
          const result = await db.all(result)
          response.send(result.map(eachObject => convertToObject(eachObject)))
        }
      }
      break
  }
})

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const query = `select * from todo where id="${todoId}"`
  const result = await db.get(query)
  response.send(convertToObject(result))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const isvaliddate = isValid(new Date(date))
  if (isvaliddate) {
    const new_date = new Date(date)
    const formatted_date = format(new_date, 'yyyy-MM-dd')
    const query = `select * from todo where due_date="${formatted_date}"`
    const result = await db.all(query)
    response.send(result.map(eachObject => convertToObject(eachObject)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (status !== 'TO DO' && status !== 'IN PROGRESS' && status !== 'DONE') {
    response.status(400)
    response.send('Invalid Todo Status')
  } else {
    if (category !== 'WORK' && category !== 'HOME' && category !== 'LEARNING') {
      response.status(400)
      response.send('Invalid Todo Category')
    } else {
      if (priority !== 'HIGH' && priority !== 'MEDIUM' && priority !== 'LOW') {
        response.status(400)
        response.send('Invalid Todo Priority')
      } else {
        if (isValid(new Date(dueDate)) === false) {
          response.status(400)
          response.send('Invalid Due Date')
        } else {
          const query = `insert into todo
           values(${id},"${todo}","${category}","${priority}","${status}","${dueDate}")`
          const result = await db.run(query)
          response.send('Todo Successfully Added')
        }
      }
    }
  }
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  switch (true) {
    case hasStatusProperty(request.body):
      const {status} = request.body
      if (status !== 'TO DO' && status !== 'IN PROGRESS' && status !== 'DONE') {
        response.status(400)
        response.send('Invalid Todo Status')
      } else {
        const {status} = request.body
        query = `update todo set status="${status}" where id="${todoId}"`
        const result = await db.run(query)
        response.send('Status Updated')
      }
      break
    case hasPriorityProperty(request.body):
      const {priority} = request.body
      if (priority !== 'HIGH' && priority !== 'MEDIUM' && priority !== 'LOW') {
        response.status(400)
        response.send('Invalid Todo Priority')
      } else {
        query = `update todo set priority="${priority}" where id="${todoId}"`
        const result = await db.run(query)
        response.send('Priority Updated')
      }
      break
    case hasTodoProperty(request.body):
      const {todo} = request.body
      query = `update todo set todo="${todo}" where id="${todoId}"`
      const result = await db.run(query)
      response.send('Todo Updated')
      break
    case hasCategoryProperty(request.body):
      const {category} = request.body
      if (
        category !== 'WORK' &&
        category !== 'HOME' &&
        category !== 'LEARNING'
      ) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else {
        query = `update todo set category="${category}" where id="${todoId}"`
        const result = await db.run(query)
        response.send('Category Updated')
      }
      break
    case hasDueDateProperty(request.body):
      const {dueDate} = request.body
      const isvaliddate = isValid(new Date(dueDate))
      if (isvaliddate) {
        query = `update todo set due_date="${dueDate}" where id="${todoId}"`
        const result = await db.run(query)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `delete from todo where id="${todoId}"`
  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
