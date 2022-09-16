const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
// Some browser requires npm i cors  | for security purposes
const cors = require('cors');


dotenv.config({path: './.env'});

const port = process.env.PORT;
const hostname = 'localhost';



const app = express();

app.use(cors());
// parses json
app.use(express.json());
app.use(express.urlencoded( {extended: true}));
app.use('/public', express.static(path.join(__dirname, '/public')));


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATEBASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

app.use('/users', require('./routes/user'));
app.listen(port, hostname, ()=>{
    console.log(`Server Started at : http://${hostname}:${port}`);

    db.connect((err)=>{
        if(err){
            console.log('Database error:' + err.message);
        }else{
            console.log('Database Connected');

        }

    })
})