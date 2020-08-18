var mongoUtil = require( './mongoUtil' );
var db = mongoUtil.getUdb();
var collection = db.collection('users3');

/*
collection.find().toArray((err, items) => {
            console.log(items)
            collection.deleteMany({})
        })
*/
function registerUser(form){

    return new Promise(function(resolve){

        var info_obj = {
            username : form.username,
            password : form.password,
            colors : {

                primaryColor : form.primaryColor,
                secendaryColor : form.secendaryColor
            }
        }
        collection.insertOne(info_obj, (err, result) => {    
                
            if (err) throw err;
            resolve(true);         
        }) 
    });
}   

function getInfoObj(username){
//console.log(username)
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

function compareLogin(input){

    return new Promise((resolve) => {
        var query = { username: input.username };
        collection.find(query).toArray(function(err, result) {
              
            if (err) throw err;
            if(result.length > 0){
                if(result[0].password == input.password){
                    resolve(true);         
                }else{                 
                    resolve(false);      
                }
            }else{
            resolve(null);
            }
        }); 
    });
}
module.exports.regUser = registerUser;
module.exports.compLogin = compareLogin;
module.exports.getInfoObj = getInfoObj;

    
       /* collection.find().toArray((err, items) => {
            console.log(items)
        })
        */
      //  collection.deleteMany({})
    
       /*       "game_stats" : {
               
                "rate": "50",
                "kapital" : "1000",
                "color"	   : form.color     
            },
            "lastupd" : (new Date(0)).toString()
            ,
            "EC" : {
                "städer"  : [],
                "kapital" :[],
                "withdrawls" : {
                        "stockholm" : "5"
                },
                "deposits" : {
                    "stockholm" : "5"
                }
            },
            "game_notiser" : []*/
