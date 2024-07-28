const bodyParser = require('body-parser');
const express=require('express');
const app = express();
const userRoutes=require('./routes/userRoutes')
const expenseRoutes=require('./routes/expenseRoutes')
const db=require('./db')
require('dotenv').config();

app.use(bodyParser.json());
app.use('/users',userRoutes)
app.use('/expenses',expenseRoutes)

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
})