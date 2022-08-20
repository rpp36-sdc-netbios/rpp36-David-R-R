const { Client } = require('pg')
const client = new Client({
  user: 'davidlim',
  host: 'localhost',
  port: 5432,
  database: 'ratingsandreviews'
})

client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = client;