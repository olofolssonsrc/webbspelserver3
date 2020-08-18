const MongoClient = require( 'mongodb' ).MongoClient;
const url = "mongodb://localhost:27017";

var udb;
var gdb;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( url,  { useNewUrlParser: true, useUnifiedTopology: true },
      function( err, client ) {
      udb  = client.db('userbase');
      gdb  = client.db('gamebase');
      return callback( err );
    } );
  },

  getUdb: function() {
    return udb;
  },
  getGdb: function() {
    return gdb;
  }

};