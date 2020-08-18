var mongoUtil = require( './mongoUtil' );
const { query } = require('express');
var db = mongoUtil.getUdb();
var collection = db.collection('usergamedata');
/*
collection.find().toArray((err, items) => {
    console.log(items)
    collection.deleteMany({})
})
*/
function getGameInfoObj(username){

    return new Promise(function(resolve){
        var query = { username: username };
        collection.find(query).toArray(function(err, result) {
              
            if (err) throw err;
            if(result[0] == undefined){
                resolve(undefined);
            }else{                 
                resolve(result[0]);
            }        
        }); 
    });
}

function updateGameInfoObj(username, stadId){

    return new Promise(function(resolve){

    var query = {username : username}
    var nystadQuery ={ $push: { städer : stadId } }

    collection.updateOne(query, nystadQuery, function(err, res) {
        if (err) throw err;

        resolve(true)
  });
});
}

function transaction(username, amount) {
    console.log(amount)
    return new Promise(function(resolve){

        var query = {username : username}

        collection.updateOne(query, {$inc :{kapital: amount} }, function (err, res) {
            if (err) throw err;
            resolve(true)
        })
    });
}

function räknautKapital(username){

getGameInfoObj(username).then(info => {






})
}

function newEvent(username, eventInfoObj){

    return new Promise(function(resolve){

        var query = {username : username}
        
        var nyEventQuery ={ $push: { events : eventInfoObj } }
    
        collection.updateOne(query, nyEventQuery, function(err, res) {
            if (err) throw err;
            resolve(true)
      });
    });
}

function gameInfoObj(form){

    this.username = form.username;
    this.kapital = 1000;
    this.rate = 0;

    this.städer = [];
    this.events = [];
}

function setGameInfoObj(form){

    var gameObj = new gameInfoObj(form);
    collection.insertOne(gameObj, (err, result) => {    
                
        if (err) throw err;
        return(true);         
    })
}

module.exports.transaction = transaction;
module.exports.newEvent = newEvent;
module.exports.updInfObj = updateGameInfoObj;
module.exports.getInfObj = getGameInfoObj;
module.exports.setInfObj = setGameInfoObj;