const express = require('express');
const path = require('path');
const app = express();
const env = require('dotenv').config();
const authRoutes = require('./src/routes/auth');
const profileRoutes = require("./src/routes/profile");
const adminRoutes = require('./src/routes/admin');
const activityRoutes = require('./src/routes/activity');


app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '../frontend')));


app.use('/', authRoutes);
app.use("/", profileRoutes);
app.use("/admin", adminRoutes);
app.use('/', activityRoutes);

app.listen(process.env.PORT, () => {
    console.log('run server port :' + process.env.PORT);
})