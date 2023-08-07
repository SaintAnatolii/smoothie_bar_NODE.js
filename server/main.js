const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.json())
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
})

app.get('', (req, res) => {
    res.send(`Сервер запущен и работает по адресу http://127.1.0.0:${PORT}`)
})

app.get('/api/goods',(req, res) => {
    try {
        const goods = JSON.parse(fs.readFileSync('db.json'))
        res.json(goods)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Interval server error' })
    } 
})

app.get('/img/:filename',(req, res) => {
    const {filename} = req.params
    const imagePath = path.join(__dirname,'img', filename)
    // console.log(imagePath)
    try {
        res.sendFile(imagePath)
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: 'Image not found' })
    }
})

app.post('/api/order', (req, res) => {
    const {name, phone, adress, products} = req.body

    if (!name || !phone || !adress || !products) {
        res.status(400).json({ error: 'Missing required fields' })
        return
    }

    const order = {name, phone, adress, products}

    try {   
        const orders = JSON.parse(fs.readFileSync('orders.json', 'utf8'))
        orders.push(order)
        fs.writeFileSync('orders.json', JSON.stringify(orders))
        console.log('Новый заказ успешно добавлен')
        res.json({ message: 'Новый заказ успешно добавлен'})
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
})

const ordersFilePath = path.join(__dirname, 'orders.json');
fs.access(ordersFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Если файл не найден, создаем его
        fs.writeFileSync(ordersFilePath, '[]');
        console.log(`Файл ${ordersFilePath} создан`);
      } else {
        console.log(`Файл ${ordersFilePath} уже существует`);
      }
    });

const dbFilePath = path.join(__dirname, 'db.json');
fs.access(dbFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Если файл не найден, создаем его
        fs.writeFileSync(dbFilePath, '[]');
        console.log(`Файл ${dbFilePath} создан`);
      } else {
        console.log(`Файл ${dbFilePath} уже существует`);
      }
    });

app.listen(PORT, () => {
    console.log(`Сервер запущен и работает по адресу http://127.1.0.0:${PORT}`)
})


// http://127.1.0.0:3000/api/goods