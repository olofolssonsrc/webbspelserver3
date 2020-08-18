const port = 3000;
const session = require('express-session');
const http = require('http');
var colors = require('colors');
const express = require('express'),

	app = module.exports.app = express();
	app.set('view engine', 'ejs');
	app.set('views', 'site/views');
	
const server = http.createServer(app);
const io = require('socket.io').listen(server); 
var mongoUtil = require( './mongoUtil' );

mongoUtil.connectToServer( function( err, client ) { //connectar till databasen
  if (err){console.log(err)}else{console.log("Server ansluten till databasen")} ;

   user_manager = require('./database_user_manager');
   usergame_manager = require('./database_usergamedata_manager');
   city_manager = require('./database_city_manager')
} );

app.use(express.urlencoded({ extended: false}));

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: '42gsfdd378d'
}));

const redirectLogin = (req, res, next) => {
	if(!req.session.username){

		res.redirect('/site/login')
	}else{
		next();
	}
}
const redirectHome = (req, res, next) => {
	if(req.session.username){
		
		res.redirect('/site')
	}else{
		next();
	}
}

app.get('/', (req, res) => {

res.redirect('/site')
})
app.use('/site/assets', express.static('site/assets'))
app.get('/site', (req, res) => {

	if (req.session.username) {

			res.render('index', {loggedin: req.session.username});		
		}
		else{
			res.render('index', {loggedin: undefined});			
		}		
});

app.get('/site/register', (req, res) =>{

	res.render('register');
});

app.post('/site/register', async (req, res) =>{

	user_manager.regUser(req.body).then((register_status) => {

		if(register_status == true){
			res.render('register_conf.ejs', {username : req.body.username});
			usergame_manager.setInfObj(req.body);
		}else{
			res.send("det uppstod ett fel vid registrering av konto");
		}
	})
});

app.get('/site/login', redirectHome, (req, res) =>{
	
	res.render('login', {passwordwrong: false, usernamewrong: false});
});

app.post('/site/login', async (req, res) =>{

	user_manager.compLogin(req.body).then((login_status) => {
		if (login_status == true) {
			req.session.username = req.body.username; 
			res.redirect("/site");
		}else if(login_status == false){
	
			res.render('login.ejs', {passwordwrong: true, usernamewrong: false});
		}else{
	
			res.render('login.ejs', {usernamewrong: true, passwordwrong: false});
		};
	})
});

app.get('/logout', (req, res) =>{
	
	req.session.destroy(err => {
		if(err){
			return res.redirect('/site');
		}
	});
	res.redirect('/');
});

function generateSocketKey(){

	var key = "";
	var i = 0;
	while(i < 20){
		var piece = Math.floor(Math.random() * 12); 
		key += piece;
		i++;
	}
	key = key.substring(0, 20);

	return key;
}

var socketAscosiationskeyusername = {};
var socketAscosiationsusernamekey = {};

app.get('/spel', redirectLogin);
app.use('/spel', redirectLogin, express.static('spel'));
app.get('/spel/spelsida_canvas', redirectLogin, (req, res) => {

			res.sendFile(__dirname + '/spel/spelsida_canvas.html');
});

app.get('/spel/socketConnect', (req, res) => {

	var key = generateSocketKey();
	if(socketAscosiationsusernamekey[req.session.username] == undefined){

		socketAscosiationskeyusername[key] = req.session.username;
		socketAscosiationsusernamekey[req.session.username] = key;
	}else{

		var oldkey = socketAscosiationsusernamekey[req.session.username];
		delete socketAscosiationskeyusername[oldkey];
		socketAscosiationskeyusername[key] = req.session.username;
		socketAscosiationsusernamekey[req.session.username] = key;
	}
	res.json(key)
})
app.get('/spel/yoyo', (req, res) => {

	res.json("key")
})


io.on('connection', socket => {
		
	socket.on('handshake', async (key) => {

		key = String(key);
		if(socketAscosiationskeyusername[key] != undefined){
			socket.id = key;
			console.log(socketAscosiationskeyusername[key] + " connected")
		}else{
			console.log("failed");
		}
	})

	socket.on('getInfObj', async () => {

		usergame_manager.getInfObj(socketAscosiationskeyusername[socket.id]).then((result) => {
		socket.emit('infObj', result);

	/*	if(result == null){
			usergame_manager.setInfObj(socketAscosiationskeyusername[socket.id]);
			console.log("ny spelare")
		}*/
		})
	})

	socket.on('disconnect', async () => {

		console.log(socketAscosiationskeyusername[socket.id] + " disconected")
	})

	socket.on('get_chunk_req', async chunk => {
			
			city_manager.getChunk(chunk).then((chunk_obj) => {			
			socket.emit('get_chunk_res', chunk_obj);
		});
	})

	socket.on('armyMovement', async armyMovementInf => {

		city_manager.getObjById(armyMovementInf.Id).then(obj => {
	
			if(socketAscosiationskeyusername[socket.id] == obj[0].owner){
	
					//movement måste ses över, ingen databas request borde behövas. getobj by id objektet
					//borde skickas med in i calcpos så att den ej behöver köras 2 ggr.
					city_manager.calcSpos(armyMovementInf).then(async fullArmyMovementInf => {
		
						io.sockets.emit('armyMovementUpdate', fullArmyMovementInf);
						city_manager.updateArmyPos(fullArmyMovementInf);
					});
			}
		})
	})

	function createEventObj(infoObj){

		this.time = new Date();
		this.type = "nystad";
	//	console.log(infoObj);
		this.objId = infoObj.Id;
	}

	socket.on('get_playerInf', async username => {

		user_manager.getInfoObj(username).then(playerData => {

		//	console.log(username, playerData, playerData.colors)
			playerData.colors.owner = username;
			playerData.colors.objType = 'playercolors'
			socket.emit('get_playerInf_res', playerData.colors);
		})
	});

	socket.on('skapaStad', async stad => {

		usergame_manager.getInfObj(socketAscosiationskeyusername[socket.id]).then((result) => {

			if(result.städer.length < 1){

				execute(-100)
			}else{

				if(result.kapital >= 100){
					execute(-100)
				}	
			}
		})
			function execute(belopp) {
				
				var armyinf = city_manager.calcArmyinfFromReq({owner : socketAscosiationskeyusername[socket.id] , namn : stad.stadnamn, sPos : {x : stad.x , y : stad.y},ePos : {x : stad.x , y : stad.y}})
				io.sockets.emit('create_army_res', armyinf);
				stad.owner = socketAscosiationskeyusername[socket.id];
				io.sockets.emit('create_town_res', stad);
				city_manager.storeArmy(armyinf);
				usergame_manager.transaction(socketAscosiationskeyusername[socket.id], belopp);
				city_manager.storeCity(stad, socketAscosiationskeyusername[socket.id]);
				usergame_manager.updInfObj(socketAscosiationskeyusername[socket.id], stad.Id);
				usergame_manager.newEvent(socketAscosiationskeyusername[socket.id], new createEventObj(stad));		
			}	
			//city_manager.getChunk(chunk).then((chunk_obj) => {			
			//socket.emit('res', {'succes' : true});		
			//	});
	})
});

/*function sendInfoObj(socket){

	usergame_manager.getInfObj(socketAscosiationskeyusername[socket.id]).then((result) => {
		socket.emit('infObj', result);
		})
}
*/
//server.listen(process.env.PORT || port);
server.listen(port);


