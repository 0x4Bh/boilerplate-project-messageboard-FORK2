const mongoose = require('mongoose');
const DB = mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  dbName: 'message_board'
});

module.exports = DB;
