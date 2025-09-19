const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const actionRoutes = require('./routes/actions');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // serve screenshots

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(config.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(()=> {
    console.log('Mongo connected');
    app.listen(config.PORT, ()=> console.log('Server running on', config.PORT));
  })
  .catch(err=> console.error('Mongo err', err));
