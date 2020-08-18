var mongoUtil = require( './mongoUtil' );
var db = mongoUtil.getGdb();
var chunkObjs = db.collection('chunkObjs');

//kod för att radera alla objekt i databasen 
/*chunkObjs.find().toArray((err, items) => {
            console.log(items)
            chunkObjs.deleteMany({})
        })
*/
function storeCity(cityinf, owner){

    var chunkx = Math.round(parseInt(cityinf.x) / 80)
    var chunkz = Math.round(parseInt(cityinf.y) / 80)
    
    var chunk = chunkx + " " + chunkz;
  
    cityinf.Id = generateCityId();
    cityinf.objType = 'stad';
    cityinf.owner = owner;
    cityinf.chunk = chunk;
 
    chunkObjs.insertOne(cityinf, (err, result) => {
        if(err)
            throw(err)
        else{
            console.log('staden ' + cityinf.stadnamn + ' har grundats'); 
            //return cityinf.Id;
        }
    });
    user_manager.getInfoObj(owner).then(inf => {

    //    console.log(inf)
        var playerInfo = {

            owner : owner,
            colors : inf.colors,
            objType : 'playercolors',
            chunk : chunk
        }

        chunkObjs.insertOne(playerInfo, (err, result) => {
            if(err)
                throw(err)
            else{
                console.log(playerInfo); 
                //return cityinf.Id;
            }
        });
    })
}


function calcArmyinfFromReq(startSettings){

    var positionInf = {

        sPos: {x : parseInt(startSettings.sPos.x), y : parseInt(startSettings.sPos.y)},
        ePos: {x : parseInt(startSettings.ePos.x), y : parseInt(startSettings.ePos.y)},
        sTid: Date.now()
    }

    var chunkx = Math.round(parseInt(startSettings.sPos.x) / 80)
    var chunkz = Math.round(parseInt(startSettings.sPos.y) / 80)
    
    var chunk = chunkx + " " + chunkz;
  
    var armyInf = {};

    armyInf.owner = startSettings.owner;
    armyInf.namn = startSettings.namn;
    armyInf.positionInf = positionInf;
    armyInf.Id = generateCityId();
    armyInf.objType = 'army';
    armyInf.chunk = chunk;

    return armyInf;
}

function storeArmy(armyInf){

    chunkObjs.insertOne(armyInf, (err, result) => {
        if(err)
            return(err)
        else{
            console.log('armen ' + armyInf.namn + ' har etablerats'); 
        }
    })
}

function pytagorasSats(A, B){
    return Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2));
}

function calculateSpos(data){
    return new Promise((resolve) => {

        getObjById(data.Id).then( async oldInf => {
                    
            var armyInf = oldInf[0];
    
            var sPos;
    
            var nuTid = Date.now();
    
            var oldSpos = armyInf.positionInf.sPos;
            var oldEpos = armyInf.positionInf.ePos;
        
            var oldsTime = armyInf.positionInf.sTid;
        
            var timeDiff = nuTid - oldsTime;
        
            var pathVec = {x : oldEpos.x - oldSpos.x, y : oldEpos.y - oldSpos.y}
        
            var pathLength = pytagorasSats(pathVec.x, pathVec.y);
        
            var timeFrac = timeDiff / (pathLength * 1000);
        
            if(timeFrac == Infinity || timeFrac >= 1){
        
                sPos = oldEpos;
            }else{
        
                sPos = {x : oldSpos.x + (timeFrac * pathVec.x), y : oldSpos.y + (timeFrac * pathVec.y)}
            }
    
            var newPositionInf = {
    
                sPos: sPos,
                ePos: data.ePos,
                sTid: nuTid,
                Id : data.Id
            }
        //    console.log(newPositionInf.ePos, newPositionInf.sPos)
            resolve(newPositionInf)
        })  
    }); 
}

function updateArmyPosition(newPositionInf) {

    return new Promise((resolve) => {

        var query = {Id : newPositionInf.Id} 

        var nyInfo = { $set: {positionInf: newPositionInf} };
        
        chunkObjs.updateOne(query, nyInfo, function (err) {
            if (err) throw err;
            
            resolve(true)
        })
    });
}

function generateCityId(){

	var Id = "";
	var i = 0;
	while(i < 20){
		var piece = Math.floor(Math.random() * 12); 
		Id += piece;
		i++;
	}
	Id = Id.substring(0, 20);

	return Id;
}

function getChunk(chunk){

    console.log('frågade efter chunk ' + chunk)
    return new Promise(function(resolve){
        var query = { chunk : chunk };
        chunkObjs.find(query).toArray(function(err, result) {
           if (err) throw err;
                resolve(result)
         });
      });   
}

function getObjById(Id){

    return new Promise(function(resolve){
        var query = { Id : Id };
        chunkObjs.find(query).toArray(function(err, result) {
           if (err) throw err;
                resolve(result)
         });
      });   
}

module.exports.getChunk = getChunk;
module.exports.storeCity = storeCity;
//module.exports.storeObj = storeObj;
module.exports.storeArmy = storeArmy;
module.exports.updateArmyPos = updateArmyPosition;
module.exports.calcSpos = calculateSpos;
module.exports.getObjById = getObjById;
module.exports.calcArmyinfFromReq = calcArmyinfFromReq;
/*
mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) {
    console.error(err)
    return
  }
    db = client.db('gamebase');
    collection = db.collection('städer');

    
    collection.insertOne({name: 'Allah'}, (err, result) => {
        //console.log(result);
    })

    collection.find().toArray((err, items) => {
        console.log(items)
    })

    collection.updateOne({name: 'Allah'}, {'$set': {'name': 'Jesus'}}, (err, item) => {
        console.log(item.id)
      })

      collection.find().toArray((err, items) => {
        console.log(items)
    })

});

/*
städer.find().toArray((err, items) => {
    console.log(items)
})*/


