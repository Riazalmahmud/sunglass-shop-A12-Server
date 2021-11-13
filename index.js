const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const port = process.env.PORT || 5000
const cors = require('cors');
require('dotenv').config()
// middleware 
app.use(cors())
app.use(express.json())


// mongobd main url 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fq8sq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("sunglass_shop");
        const productCollection = database.collection("products");
        const usersCollection = database.collection("users");


        // Get api 
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const service = await cursor.toArray()
            res.send(service)
        })

        // GET Single Service
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.json(service);
        })

        // DELETE API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })

        app.post('/products', async (req, res) => {
            const service = req.body
            console.log('hited the post ', service)
            const result = await productCollection.insertOne(service);
            res.json(result)
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
        });


        // user clearance 

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // user admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Hello assignment-12!')
})

app.listen(port, () => {
    console.log(` assignment-12:${port}`)
})