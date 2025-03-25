// db.js
const mongoose = require('mongoose');

// MongoDB接続
mongoose.connect('mongodb://localhost:27017/myappadb')
  .then(() => console.log('MongoDBに接続しました'))
  .catch(err => console.error('MongoDB接続エラー:', err));

module.exports = mongoose;