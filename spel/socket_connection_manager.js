var socketAssociationKey;

    socketConnect();

function socketConnect(){
    fetch('socketConnect')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
        socketAssociationKey = data;
        conncetion();
    });
}

function conncetion(){

    socket = io('http://localhost:3000')

    socket.on('connect', function(){
        console.log("sending handshake");
        socket.emit('handshake', socketAssociationKey);
        socket.emit('getInfObj');       
    });
    
    var hasInitialized = false;

    socket.on('infObj', data => {

        //    console.log(data);
           // ;
            
            if(data == null || data == undefined || data.städer.length < 1){
                updateStats(data);//updaterar kapital och rate variablerna
                startGame();
          //    startNewGameRoutine();  
                   
            }else{
                
                console.log("hämtat info");
                updateStats(data);//updaterar kapital och rate variablerna
                if(!hasInitialized){
                    startGame();
                    hasInitialized = true;
                }
            }      
    })

    socket.on('create_town_res', stad => {
 
            if(playerColors[stad.owner]) {
                render_town(stad)
            }else{

                console.log(stad.owner)
                console.log(stad)
                getPlayerInf(stad.owner);
                render_town(stad)
            }
            
            //!!!!!!!!!!!!!!!1KOLLA OM DENNA FINNS I PLAYEROBJECTS OCH OM DEN INTE GÖR DET
            //FRÅGA SERVER EFTER PLAYEROBJEKT. ELLER KANSKE SERVER AUTOMATISKT SKICKAR MED DEN MED VARJE NY STAD
            //OCH NY ARME?

           
           // socket.emit('getInfObj')
    })

    socket.on('get_chunk_res', data => {

   //   console.log(data);
    
        if(data != null){
            renderChunk(data);
        }
    })

    socket.on('armyMovementUpdate', armyMovementInf => {

        //armyinf är den nya armens armyinf
     //   console.log(armyMovementInf)
       // renderdArmys[armyinf.armyinf.Id].armyinf = armyinf.armyinf;  
        nyDestination(armyMovementInf)
    })

    socket.on('create_army_res', armyInf => {

        if(playerColors[armyInf.owner]) {
            render_army(armyInf)
        }else{

            console.log(armyInf.owner)
            getPlayerInf(armyInf.owner);
            render_army(armyInf)
        }
    })

    socket.on('get_playerInf_res', playerInf => {


        console.log(playerInf)
        playerColors[playerInf.owner] = playerInf;


    })
}

function stringPosToInt(stringPos){

var xPos;
var yPos;

var i = 0;

var currentPos = "";

while(true){

    if(stringPos[0] == ','){

            xPos = parseInt(currentPos);
            currentPos = "";
    }
    else if(i == stringPos.length - 1){
        
        yPos = parseInt(currentPos);
        break;
    }
    else{

        currentPos += stringPos[i]
    }
    i++;
}
}

function skapaStadReq(cityInf){

    socket.emit('skapaStad', cityInf)  
    kapital -= 100;
    rate += 1;
    updateStatsUI();
}

function getPlayerInf(username){

    socket.emit('get_playerInf', username)  
}

function armyMovementReq(xxx){
    //console.log(armyinf)
    socket.emit('armyMovement', xxx)

}

function startGame(){

    time = Math.PI;
    window.requestAnimationFrame(frame);
    socket.emit('get_chunk_req', '0 0');    
}


function startNewGameRoutine(){
    
//function getChunkReq(chunk){
//}
    x = new foundCityUI();
}




function generateRandomKey(){

	var key = "";
	var i = 0;
	while(i < 20){
		var piece = Math.floor(Math.random() * 50) + 1; 
		key += piece;
		i++;
	}
	key = key.substring(0, 6);

	return key;
}





function updateNationInf(){
    fetch('/spel/yoyo')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
       console.log(data);
    });
}



/*data = {name: userName, userId: socket.id};
socket.emit('setSocketId', data);
*/
/*function grunda_stad_förfrågan(cityinf){

    cityinf = {

        x : cityinf.x,
        z : cityinf.z,
        stadnamn : cityinf.stadnamn

    }
    console.log("skickade förfrågan om att skapa stad" + cityinf.x)
    socket.emit('grund_stad_forf', cityinf );

}*//*
function getChunkReq(chunk){

    socket.emit('get_chunk_req', chunk);

}

socket.on('get_chunk_res', data => {

    if(data != null){
        renderChunk(data);
    }
})

socket.on('create_town_res', data =>{

        console.log('en ny stad grundades vid' + data.x + data.z);
        window.render_town(data)
})
socket.on('info', data =>{

    console.log(data);

})
*/
