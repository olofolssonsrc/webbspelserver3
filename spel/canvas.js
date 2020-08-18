   
    var c = document.getElementById("canvas");

//initiera rendern
    var renderer = new THREE.WebGLRenderer({canvas: c});

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( innerWidth, innerHeight );
    document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var loader = new THREE.GLTFLoader();






//initiera kameran
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 150);
    camera.position.y =  generate_y(worldposx, worldposz) + 20;
    camera.position.z = 0; 
    camera.position.x = 0; 
    camera.rotation.x =  Math.PI * 1.7;
     var cammovespeed = 1;
     

var worldposx = camera.position.x;
var worldposz = camera.position.z;

//initiera bakrundLjuset

const light = new THREE.AmbientLight('#ffffFF', .3);
scene.add(light);

//initiera solLjuset
    var sunLight = new THREE.DirectionalLight(0xffffcc, .7);
    scene.add(sunLight);

//initiera raycastern och raycastlistener
    var raycaster, mouse = { x : 0, y : 0 };
    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener( 'click', raycast, false );

    function raycast ( e ) {


       //1. sets the mouse position with a coordinate system where the center
        //   of the screen is the origin
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    
        //2. set the picking ray from the camera position and mouse coordinates
        raycaster.setFromCamera( mouse, camera );    
    
        //3. compute intersections
       // console.log(scene.children.length)
        var intersects = raycaster.intersectObjects( scene.children );
    
        for ( var i = 0; i < intersects.length; i++ ) {

            if(!WFC.checkRightInput(e.button, intersects[ i ])){

              //  clickedObj(intersects[ i ], e);
            }

           /* if(intersects[ i ].geometryType == 'chunkGeometry'){
                selecedObjId = '';
            }*/
            /*
                An intersection has the following properties :
                    - object : intersected object (THREE.Mesh)
                    - distance : distance from camera to intersection (number)
                    - face : intersected face (THREE.Face3)
                    - faceIndex : intersected face index (number)
                    - point : intersection point (THREE.Vector3)
                    - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
        } 
    }


var hoveringStad;

function clickedObj(e){

    if(selectedObjId != ''){

    var position = new THREE.Vector2(e.pageX, e.pageY) 

    for (let j = 0; j < renderdCitys.length; j++) {
                  
        const tomV = new THREE.Vector3(); //bara en standard tom vector för att aligna 3d värden med skärmen
        //denna funktion alignar 3d geometrin med ui (stadens namn headers) 
    
        var mesh = renderdCitys[j].cityMesh;

        mesh.updateWorldMatrix(true, false);
        mesh.getWorldPosition(tomV);
    
        //console.log(renderdCitys[j])

        tomV.project(camera);
    
        var x = (tomV.x *  .5 + .5) * canvas.clientWidth;
        var y = (tomV.y * -.5 + .5) * canvas.clientHeight;

        if(pytagorasSats(position.x - x, position.y - y) < 50){

      //     document.body.style.cursor = 'url(assets/hoverStadCursor.png)1 1, pointer';
           //console.log('a')
           hoveringStad = renderdCitys[j];
           break;
        }else{
            hoveringStad = undefined;
        }
    }
    }
}

function teleport(x , z){

    camera.position.z = z;
    camera.position.x = x;
    camera.position.y = generate_y(x, z) - 15;

    worldposx = camera.position.x;
    worldposz = camera.position.z;
   
    for (var chunk in renderdchunks) {
        if (renderdchunks.hasOwnProperty(chunk)) {                
            scene.remove(renderdchunks[chunk])
            delete renderdchunks[chunk]; 
        }
      }

    renderdchunks = [];
    lastchunk = [];
    cchunk = Math.round(worldposx / rader) + " " +  Math.round(worldposz / rader);

    renderdCitys.forEach(city => {
       
      alignui(city.cityMesh, city.nameUI);

   });
}

function alignui(mesh, ui){

    const tomV = new THREE.Vector3(); //bara en standard tom vector för att aligna 3d värden med skärmen
    //denna funktion alignar 3d geometrin med ui (stadens namn headers) 

    mesh.updateWorldMatrix(true, false);
    mesh.getWorldPosition(tomV);


    tomV.y += 6;
    tomV.project(camera);

    var x = (tomV.x *  .5 + .5) * canvas.clientWidth;
    var y = (tomV.y * -.5 + .5) * canvas.clientHeight;
    
    ui.style.top = y;
    ui.style.left = x;
}

var renderdCitys = [];
var renderdArmys = [];

render_gruva();

function render_gruva(){
 
     loader.load('assets/3dModels/koppargruva.glb', (gltf) => {
       
         gruvamesh = gltf.scene.children[0];    
         var y = generate_y(0, 0);
         gruvamesh.position.x = 0;
         gruvamesh.position.z = 0;
         gruvamesh.position.y = y;
         randomrot = Math.random() * 360;
         gruvamesh.rotation.y = randomrot;
         gruvamesh.scale.set(.3,.3,.3);
         scene.add(gruvamesh);
     });
 }

function render_town(cityinf){

   // console.log("rendering town");

    var x = parseInt(cityinf.x);
    var z = parseInt(cityinf.y);

    loader.load('assets/3dModels/stadUtzoomad.glb', (gltf) => {
      
        citymesh = gltf.scene.children[0];    
        var y = generate_y(x, z);
        citymesh.position.x = x;
        citymesh.position.z = z;
        citymesh.position.y = y;
        randomrot = Math.random() * 360;
        citymesh.rotation.y = randomrot;
        citymesh.scale.set(2,2,2);
        scene.add(citymesh);
        
    var ui = cityHeaderUI(cityinf);

    alignui(citymesh, ui);

    var city = {

        nameUI : ui,
        cityMesh : citymesh,

    }
    renderdCitys.push(city);
    
    });

}

function nyDestination(armyMovementInf){

renderdArmys[armyMovementInf.Id].armyinf.positionInf.sPos = armyMovementInf.sPos;
renderdArmys[armyMovementInf.Id].armyinf.positionInf.ePos = armyMovementInf.ePos;
renderdArmys[armyMovementInf.Id].armyinf.positionInf.sTid = armyMovementInf.sTid;
updateArmyPosition(renderdArmys[armyMovementInf.Id])
}

function pytagorasSats(A, B){
    return Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2));
}

//räknar ut polition för 3dmodellen basetar på positioninf i armyinf bör göras mer kompakt
function updateArmyPosition(army){

    var positionInf = army.armyinf.positionInf;
    
    var ePos = positionInf.ePos;
    var sPos = positionInf.sPos;
    var sTid = positionInf.sTid;

  //  console.log(positionInf)

    var timeDiff = Date.now() - sTid;

    var pathVec = {x :ePos.x - sPos.x, y :  ePos.y - sPos.y}

    var pathLength = pytagorasSats(pathVec.x, pathVec.y);

    var timeFrac = (timeDiff) / (pathLength * 1000);

    var exactPos;

    if(timeFrac >= 1){

      //  console.log('FRAMME')
        exactPos = {x : ePos.x, y : ePos.y};
        army.armyMesh.position.x = exactPos.x;
        army.armyMesh.position.z = exactPos.y;
        army.armyMesh.position.y = generate_y( ePos.x,  ePos.y) + 1;
        
    }else{
     //   console.log('GÅR')
        exactPos = {x : (timeFrac * pathVec.x), y:  (timeFrac * pathVec.y)};
        army.armyMesh.position.x = sPos.x + exactPos.x;
        army.armyMesh.position.z = sPos.y + exactPos.y;
        army.armyMesh.position.y = generate_y(sPos.x + exactPos.x, sPos.y + exactPos.y) + 1;
      
    }

    if(pathVec.x > 0){ //kolla över detta och optimisera beräkningen

        var rotation = Math.atan(pathVec.y /pathVec.x)
        army.armyMesh.rotation.y =  ((Math.PI * .5) - rotation);
    
    }else{

        var rotation = Math.atan(pathVec.y /pathVec.x)
        army.armyMesh.rotation.y =  ((Math.PI * -.5) - rotation);
    }
}

function render_army(armyinf){

     //console.log(armyinf)
    var x = parseInt(armyinf.positionInf.sPos.x);
    var z = parseInt(armyinf.positionInf.sPos.y);

    loader.load('assets/3dModels/soldatutzoomad.glb', (gltf) => {

        armymesh = gltf.scene.children[0];   
       // armymesh.material = new THREE.MeshLambertMaterial(FFFFFF) ;
        var y = generate_y(x, z);
      //  console.log(armymesh)
        armymesh.position.x = x;
        armymesh.position.z = z;
        armymesh.scale.set(.7,.7,.7);
        armymesh.position.y =  y + .3;
        
        scene.add(armymesh);
        var ui = new armyHeaderUI(armyinf);
    
        alignui(armymesh, ui);
    
        var army = {
    
            UI : ui,
            armyMesh : armymesh,
            armyinf : armyinf
    
        }
        renderdArmys[army.armyinf.Id] = army;
        
        renderer.render(scene, camera)
    })
}

var mapmesh; // variabler angående kartan/mapen

    var rader = 40;
    var columner = 40;		              	
	var quadSize = 1.5;                       
    var berghöjd = 10;
    var bergtäthet = 0.02;
    var bredd = rader * quadSize;
    var antalQuads = 3;

function generate_y(x, z){

    var  lager1 = noise.perlin2(x  * bergtäthet , z  * bergtäthet) * 5;

    /*
    optimisering ideer

    *minimera antalet noise beräkningar
    slå ihom generate y med generate color
    eller bara calla den en
    
    */

 //   var test1 = document.getElementById('test1').value;
   // var test2 = document.getElementById('test2').value;
  //  var test3 = document.getElementById('test3').value;


    var lager2 = noise.perlin2(x * bergtäthet * 2, z  * bergtäthet * 2) * 2;   
    
    lager2 = Math.pow(2.5 + (noise.perlin2(x * bergtäthet * 15, z  * bergtäthet * 15) * .2), (2 * lager2) );
    
/*
    
    
    var lager4 = noise.perlin2(x  * bergtäthet * 2.3 , z  * bergtäthet* 2.3) * berghöjd *  Math.pow(noise.perlin2(x  * bergtäthet * 0.62 , z  * bergtäthet* 0.034), 3);

    Math.pow(lager3, 1.5);


    var lager5 = noise.perlin2(x  * bergtäthet * 5, z  * bergtäthet * 5) * 2;
    var lager6 = noise.perlin2(x  * bergtäthet * 15, z  * bergtäthet * 15) * 4;

    var lager56 = (lager5 + lager6) * Math.pow(noise.perlin2(x  * bergtäthet * 0.2, z  * bergtäthet * 0.2), 2);*/

    var y = lager1 + lager2;

    return(y);
}

    function generate_map_geo(chunk) {

        var geometry = new THREE.Geometry();

    for (var z = (columner * -0.5 ) - 0; z <= (columner * 0.5  ) + 0; z++) {

            for (var x = (rader * -0.5) - 0; x <= (rader * 0.5) + 0; x++) {
    
                var xp = x* quadSize;
                var zp = z * quadSize;

                var y = generate_y(xp  + (chunk[0] * bredd), zp  + (chunk[1] * bredd));

                geometry.vertices.push(new THREE.Vector3(xp, y, zp));
            //  render_town(0,0,y)     
        
            }
        }

        var colors = generateColors(chunk); //lägger till färger

        var i = 0;
        for (var z = 0; z < columner; z++) {
            for (var x = 0; x < rader; x++) {

                var tri1 = new THREE.Face3(i, rader + (i + 1), i + 1);
                var tri2 = new THREE.Face3(i + 1, rader + (i + 1), rader + (i + 2))
    
                gräs10 = colors[i];
                gräs11 = colors[ rader + (i + 1)];
                gräs12 = colors[ i + 1];
            
                gräs20 = colors[i + 1];
                gräs21 = colors[ rader + (i + 1)];
                gräs22 = colors[ rader + (i + 2)];

            
                tri1.vertexColors[0] = gräs10;
                tri1.vertexColors[1] = gräs11;
                tri1.vertexColors[2] = gräs12;

                tri2.vertexColors[0] = gräs20;
                tri2.vertexColors[1] = gräs21;
                tri2.vertexColors[2] = gräs22;

                geometry.faces.push(tri2);
                geometry.faces.push(tri1);

                i++;
            }
            i++;
        }

        geometry.computeVertexNormals();
        geometry.computeFaceNormals();
        
        return (geometry);
        
    } 

    function generateColorNoise(x, z){

        var values = [];

        for (let i = 0; i < 6; i++) {
            
            var val = Math.round((noise.perlin2(x * 0.1, z * 0.1) * 2) + (noise.perlin2(x * 0.5, z * 0.5) * 1.5));
            values.push(val);
        }
        return(values);
    }

    function generateColors(chunk){

        var colors = [];

        for (var z = (columner * -0.5 ) -0; z <= (columner * 0.5  ) + 0; z++) {

            for (var x = (rader * -0.5) - 0; x <= (rader * 0.5) + 0; x++) {
    
                var xp = x* quadSize;
                var zp = z * quadSize;

                var colorString;
                var terrängtyp;

                terrängtyp = 'gräs';

                var y = generate_y(xp  + (chunk[0] * bredd), zp  + (chunk[1] * bredd));

                if(y > 7.5){

                    terrängtyp = 'sten';
                }

                var offsets = generateColorNoise(xp  + (chunk[0] * bredd), zp  + (chunk[1] * bredd));

                if(terrängtyp == 'gräs'){

                    var r0 = 3 + offsets[0];
                    var r1 = 3 + offsets[1];
                    var g0 = 6 + offsets[2];
                    var g1 = 6 + offsets[3];
                    var b0 = 3 + offsets[4];
                    var b1 = 3 + offsets[5];

                    colorString = "#" + r0 + r1 + g0 + g1 + b0 + b1;

                }else{

                    var r0 = 4 + offsets[0];
                    var r1 = 4 + offsets[1];
                    var g0 = 4 + offsets[2];
                    var g1 = 4 + offsets[3];
                    var b0 = 4 + offsets[4];
                    var b1 = 4 + offsets[5];

                    colorString = "#" + r0 + r1 + g0 + g1 + b0 + b1;
                }
                
                //var colorString = String(Math.abs(Math.pow(zp + 6 * xp + 3 , 5)) + "DACBBF")
                var col = new THREE.Color(colorString);
                    
                colors.push(col)
            }
        }

        return colors
    }

    function generateChunkGeometry(chunk){

        mapgeo = generate_map_geo(chunk);
        mapmat = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors });
        mapmesh = new THREE.Mesh(mapgeo, mapmat); 
        mapmesh.position.x = chunk[0] *(rader * quadSize);
        mapmesh.position.z = chunk[1] *(rader * quadSize);
        renderdchunks[chunk[0] +" "+ chunk[1]] = mapmesh;
        mapmesh.geometryType = 'chunkGeometry'
        scene.add(mapmesh);  
      //  renderer.render(scene, camera);        
    }

    var playerColors = {};

    function renderChunk(chunkobj){
        console.log(chunkobj);
        for(var i = 0; i < Object.keys(chunkobj).length; i++){

            if(chunkobj[i].objType == 'playercolors'){

              /*  chunkobj[i].sPos = new THREE.Vector2(0,0);
                chunkobj[i].sTime = Dsate.now();

                chunkobj[i].ePos = new THREE.Vector2(-30,20);
                chunkobj[i].pathVec = calcArmyPath(chunkobj[i]);
                chunkobj[i].eTime = Math.sqrts(Math.pow(chunkobj[i].pathVec.x, 2) + Math.pow(chunkobj[i].pathVec.y, 2)) * 100;
                console.log(chunkobj[i].eTime)*/
               // console.log(chunkobj[i].pathVec)
               console.log(chunkobj[i].colors)
               playerColors[chunkobj[i].owner] = chunkobj[i].colors

            }else if(chunkobj[i].objType == 'stad'){

                render_town(chunkobj[i])
            }else if (chunkobj[i].objType == 'army'){

                render_army(chunkobj[i]);
            }
        }

        
    }

    var selectedObjId = '';

/*denna funktion körs när du har hittat en destination för din army och den ska börja röra sig. 
    
    *skickar meddelande till servern 
    *ändrar riktning på lokala klienten    
    */
   function beordraArme(data){
    
    //nyDestination(data, selecedObjId)

    var ePos3D;

    if(hoveringStad){

        ePos3D = hoveringStad.cityMesh.position;
    }else{

        ePos3D = data.point;
    }
   // console.log(hoveringStad)
    var ePos2D = new THREE.Vector2(ePos3D.x, ePos3D.z)
    armyMovementReq({Id : selectedObjId, ePos : ePos2D})
    //renderdArmys[data.armyinf.Id].armyinf = data.armyinf;
   // console.log(selectedObjId)
    // armyMovementReq(sendobj)
    nyDestinationUI(selectedObjId);
  }

  /*  function nyDestination(data, armyId) {
      //  console.log(armyId)
        //console.log(renderdArmys[selecedObjId].armyinf)
        
        renderdArmys[data.armyinf.Id].armyinf = data;

      //  console.log(army)

        army.sPos = new THREE.Vector2(renderdArmys[armyId].armyMesh.position.x, renderdArmys[armyId].armyMesh.position.z);
        
        army.sTime = Date.now();
        //console.log(data)
        army.ePos = new THREE.Vector2(data.x, data.z);
        army.pathVec = calcArmyPath(army);
        console.log( army.pathVec)
        army.eTime = eTime(army.pathVec)
        

      //  console.log(selecedObjId)   
    }*/

  

var lastchunk = [];
var cchunk = [0,0];
var renderdchunks = [];

var time = (Date.now() * 1000 * 60 * 60 * 24) ;
var sunTilt = 3.5;

//kollar om musen hovrar ett 3d objekt 
renderer.domElement.addEventListener('mousemove', clickedObj)

function frame() {

 
    //var asdasd = Date.now() + Date.now() + Date.now() + Date.now() + Date.now() + Date.now() + Date.now() + Date.now() + Date.now() + Date.now();
    //console.log(asdasd)

    if(time >= 2 * Math.PI){

        time = 0;

    }else{
        time += (Math.PI * 2) / 2000;
    }

    sunLight.position.set(Math.sin(time) * sunTilt, 3, Math.cos(time) * sunTilt)
    sunLight.intensity = .1 + (1 - (Math.sin(time))) * 0.7
    renderer.render(scene, camera);

    if(mx != 0 || mz != 0 || ry != 0|| rx != 0|| lastchunk.length == 0){ // om spelaren förflyttades
        myAxis = new THREE.Vector3(0, 1, 0);
        camera.rotateOnWorldAxis(myAxis, (0.025 * rx)+ (0.025 * ry));
        camera.translateZ(mz * cammovespeed * 1);
        camera.translateX(mx * cammovespeed * .2); //konstigt problem med att den translatar snabbare på z axeln

       
        camera.position.y =  25 + generate_y(worldposx, worldposz);
        
        
        
        worldposx = camera.position.x ;
        worldposz = camera.position.z ;

        cchunk = [Math.round((worldposx) / (rader * quadSize)), Math.round(worldposz / (columner * quadSize))];

        if(cchunk[0] != lastchunk[0] || cchunk[1] != lastchunk[1]){

            var xc = cchunk[0];
            var zc = cchunk[1]; 
    
            var aktivaChunks = [];
    
            for (let xi = -2; xi < 3; xi++) {   
                for (let zi = -2; zi < 3; zi++) {
                     
                    var chunki = xi + xc + " " + (zi + zc);
                    aktivaChunks[chunki] = 'active'
    
                    if(!renderdchunks[chunki]){
                        generateChunkGeometry([xi + xc, zi + zc]);
                    }
                }  
            }
    
            for (var chunk in renderdchunks) {
                if (renderdchunks.hasOwnProperty(chunk)) {        
                 if(aktivaChunks[chunk] != 'active'){
                    scene.remove(renderdchunks[chunk])
                    delete renderdchunks[chunk];
                }
                }
              }
    
            lastchunk[0] = cchunk[0];
            lastchunk[1] = cchunk[1];
        } 
    }

    renderdCitys.forEach(city => {
           
        alignui(city.cityMesh, city.nameUI);

    });

    var t = Date.now();

    Object.keys(renderdArmys).forEach(function(army) {

      var armyObj = renderdArmys[army];
      updateArmyPosition(armyObj)
      alignui(armyObj.armyMesh, armyObj.UI);
       
       //console.log(renderdArmys[army])
      
      });

    

window.requestAnimationFrame(frame);
}

document.addEventListener('keydown', function(event) {
 
    if(event.keyCode == 87) {
    
        mz = -1;
        //camera.position.z += -cammovespeed;
    }
   
    if(event.keyCode == 65) {
   
        mx = -1;
        //camera.position.x += -cammovespeed;
    }
    if(event.keyCode == 83) {
   
        mz = 1;
        //camera.position.z += cammovespeed;
    }
     if(event.keyCode == 68) {
  
        mx = 1;
        //camera.position.x += cammovespeed;
    }
    if(event.keyCode == 69) { //E
  
        rx = -1;
        //came-ra.position.x += cammovespeed;
    }
    if(event.keyCode == 81) { //Q
  
        ry = 1;
        //camera.position.x += cammovespeed;
    }


});
var rx = 0;
var ry = 0;
var mz = 0;
var mx = 0; //DETTA ÄR EN TEMPORÄR RÖRELSE LÖSNING FÖR KAMERAN // detta är kontrollerna av kameran
document.addEventListener('keyup', function(event) {
     
       if(event.keyCode == 87) {
        

            mz = 0;
            //camera.position.z += -cammovespeed;

        }
       
        if(event.keyCode == 65) {
       
            mx = 0;
            //camera.position.x += -cammovespeed;

        }
        if(event.keyCode == 83) {
       
            mz = 0;
            //camera.position.z += cammovespeed;

        }
         if(event.keyCode == 68) {
      
            mx = 0;
            //camera.position.x += cammovespeed;
        }      
        if(event.keyCode == 69) { //E
        
            rx = 0;
            //camera.position.x += cammovespeed;
        }
        if(event.keyCode == 81) { //Q

            ry = 0;
            //camera.position.x += cammovespeed;
        }
});
     

