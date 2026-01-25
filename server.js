const express = require('express');
const path = require('path');
const app = express();
const env =  require('dotenv');
env.config();

app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, ('frontend'))));

app.listen(process.env.PORT , () =>{
    console.log('run server port :' + process.env.PORT);
})