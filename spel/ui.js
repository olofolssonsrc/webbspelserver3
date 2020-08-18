var leftUI = new grundLeftUI();

function foundCityUI(){

    if(document.getElementById('skapaStadUI')){
        document.getElementById('skapaStadUI').remove();
    }

    this.go = () => {

        var stadNamn = document.getElementById('stadnamn').value;
        
        var kordinatx = document.getElementById('kordinaterx').value;
        var kordinatz = document.getElementById('kordinaterz').value;
       
        var stadObj = {
            
            'stadnamn' : stadNamn,
            'x' : kordinatx,
            'y' : kordinatz
        }

        skapaStadReq(stadObj);
        document.getElementById('skapaStadUI').remove();
       // console.log(stadObj);
    }

    this.getKordinater = () => {

        WFC.startWait(0, 'kordinaterSelect');
        div.style.display = 'none';
        
    }

    this.kordinaterRecived = (kordinater) => {

       // console.log(kordinater)
        document.getElementById('kordinaterx').value = kordinater.point.x;
        document.getElementById('kordinaterz').value = kordinater.point.z;

        div.style.display = 'block';
    }

    this.cancel = () => {

        document.getElementById('skapaStadUI').remove();
        cancel.remove();
       // leftUI = new grundLeftUI();
       
    }

    var div = document.createElement("DIV");
    div.id = "skapaStadUI";
    div.classList = "ui uiCenter";
    div.style.width = 30 + "%";
    div.innerHTML += "<h2>GRUNDA STAD</h2>";
    div.innerHTML += "<div>Stadnamn : <input id='stadnamn'></div>";
    div.innerHTML += "<div>Kordinaterx : <input id='kordinaterx'></div><br>";
    div.innerHTML += "<div>Kordinaterz : <input id='kordinaterz'></div><br>";

    div.innerHTML += "<button id='hej'>hej</button>";

    var kordinatClickSelect = document.createElement("BUTTON");
    kordinatClickSelect.innerHTML = "select kordinater";
    div.appendChild(kordinatClickSelect)
    kordinatClickSelect.addEventListener('click', this.getKordinater)

    var cancel = new cancelBtn;
    div.appendChild(cancel)
    cancel.addEventListener('click', this.cancel)

    document.body.appendChild(div);
    document.getElementById('hej').addEventListener('click', this.go);
}

function kordinaterSelect(data){

  
    foundCityUIREFRENCE.kordinaterRecived(data);
}

function createFoundCityUI(){//skapar foundcityui objekt med en publik referens så att flera olika funkioner
    //har tillgång till den


foundCityUIREFRENCE = new foundCityUI();

}

function cityMenuUI(cityinf){

    if(document.getElementById('cityMenuUI')){
        document.getElementById('cityMenuUI').remove();
    }
    var div = document.createElement("DIV");
    div.id = "cityMenuUI";
    div.classList = "ui uiCenterDown";
    div.style.width = 50 + "%";
    div.innerHTML += '<h2>' + cityinf.stadnamn + '</h2>';

    this.cancel = () => {

        document.getElementById('cityMenuUI').remove();
        cancel.remove();
    }

    var cancel = new cancelBtn;
    div.appendChild(cancel)
    cancel.addEventListener('click', this.cancel)
    document.body.appendChild(div);

}

function teleportUI(){

    leftUI.clear();

    this.go = () => {

        var z = parseInt(document.getElementById("tpz").value);
        var x = parseInt(document.getElementById("tpx").value);  

        teleport(x, z);
        document.getElementById('teleporteraUI').remove();
        leftUI = new grundLeftUI();
    }

    this.cancel = () => {


        document.getElementById('teleporteraUI').remove();
        cancel.remove();
        leftUI = new grundLeftUI();
       
    }

    var div = document.createElement("DIV");
    div.id = "teleporteraUI";
    div.classList = "";
    div.style.width = 30 + "%";

    var cancel = new cancelBtn;
    
    div.innerHTML += "<div>Teleportera</div><br>";

    div.innerHTML += "<div>x : <input id='tpx'></div>";
    div.innerHTML += "<div>z : <input id='tpz'></div><br>";

    div.innerHTML += "<button id='hej'>hej</button>";


    div.appendChild(cancel)
    cancel.addEventListener('click', this.cancel)

    document.getElementById('uileft').appendChild(div);
    document.getElementById('hej').addEventListener('click', this.go);

}

function grundLeftUI(){

var meny = document.getElementById('uileft');

this.clear = () => {

meny.innerHTML = "";

}

var TeleporteraMenyKnapp = document.createElement("BUTTON");
TeleporteraMenyKnapp.innerHTML = 'teleportera';
TeleporteraMenyKnapp.id = 'tpMenyOpener';

meny.appendChild(TeleporteraMenyKnapp);


meny.innerHTML += '<br><br>'

var GrundaStadUIknapp = document.createElement("BUTTON");
GrundaStadUIknapp.innerHTML = 'GrundaStad';
GrundaStadUIknapp.id = 'GrundaStadMenyOpener';

meny.appendChild(GrundaStadUIknapp);
//foundCityui = new foundCityUI();
//teleportui = new teleportUI();
document.getElementById('GrundaStadMenyOpener').addEventListener('click', createFoundCityUI);
document.getElementById('tpMenyOpener').addEventListener('click', teleportUI);

}

function cancelBtn (){

    var knapp = document.createElement("DIV");
    knapp.innerHTML = "<-";
    knapp.style.fontSize = "20"
    knapp.classList = "";

    return knapp;
}

function cityHeaderUI(cityinf){

    var ui = document.createElement("DIV");
    ui.innerHTML = cityinf.stadnamn;
    ui.className = "cityheader";

    ui.style.backgroundColor = playerColors[cityinf.owner].primaryColor;
    ui.style.color = playerColors[cityinf.owner].secendaryColor;
    ui.style.opacity = 50 + '%';
    ui.style.borderColor = playerColors[cityinf.owner].secendaryColor;

    var id = cityinf.Id;
    ui.id = id;

    document.body.appendChild(ui);

    ui.addEventListener('click', function () {
        cityMenuUI(cityinf)
    } );

    return ui;
}

function armyHeaderUI(armyinf){

    var ui = document.createElement("DIV");
    ui.innerHTML = armyinf.namn;
    ui.className = "ui armyheader";
    ui.id = armyinf.Id;

    ui.style.backgroundColor = playerColors[armyinf.owner].primaryColor;
    ui.style.color = playerColors[armyinf.owner].secendaryColor;
    ui.style.opacity = 50 + '%';
    ui.style.borderColor = playerColors[armyinf.owner].secendaryColor;
 

    document.body.appendChild(ui);

    function SELECT(){

        ui.classList = 'ui armyheaderSELECTED';

        if(selectedObjId && selectedObjId != ui.id){

            document.getElementById(selectedObjId).classList = 'ui armyheader';
            selectedObjId = ui.id;
        }

        selectedObjId = ui.id;
    }

    ui.addEventListener('click', () => {
       
        
        SELECT();
        WFC.startWait(0, 'beordraArme')
    
    } );

    return ui;
}



function nyDestinationUI(armyId) {
   // console.log(selecedObjId);
    document.getElementById(armyId).classList = 'ui armyheader';
    selectedObjId = '';

}

function waitForClick(){

    var isWaiting = false; 
    var waitInput;
    var functionName;

    this.startWait = (input, functionname) => {

        isWaiting = true;
        waitInput = input;
        functionName = functionname;
    }

    this.stopWait = () => {

        isWaiting = false;
    }

    this.checkRightInput = (input, data) => {

        if(isWaiting){
            if(input == waitInput){
                window[functionName](data);
                isWaiting = false;
                return(true)
            }else{
                return(false)
            }
        }else{
            return(false)
        }
    }
}

var WFC = new waitForClick();
//WFC.startWait(0, 'ASDASD')


function updateStatsUI(){

    document.getElementById('rate').innerHTML = "rate:" + rate;
    document.getElementById('kapital').innerHTML = "kapital:" + parseInt(kapital);
    
}