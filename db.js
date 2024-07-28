const mongoose=require('mongoose')

require('dotenv').config();

const mongoDbUrl=process.env.MONGODB_URL;

mongoose.connect(mongoDbUrl)
.then(()=>console.log("Connected to the DB"))
.catch((e)=>console.log(`Could not connnect :${e}`))

const db=mongoose.connection;

module.exports=db;