 kapital;
 rate;
 var kapitalCounter = undefined;

function updateStats(data) {

    if(kapitalCounter != undefined){
        clearInterval(kapitalCounter);
    }

gainRate = unpackEventGain(parseInt(data.rate), data.events);

kapital = parseInt(data.kapital) + gainRate.gain;
rate = gainRate.nyrate;

//console.log(rate);
kapitalCounter = setInterval(() => {
    
    kapital += rate;
    updateStatsUI();
    }, 1000)

}

function unpackEventGain(rate, events){

    var nutid = new Date();
    var intervalRate = rate;
    var gain = 0;

    for (let i = 0; i < events.length; i++) {
        
        if(events[i].type == "nystad"){

            intervalRate += 1;
        }

        var startDate = new Date(events[i].time);
        var startTime = startDate.valueOf();
        var stopTime;

        if(i == events.length - 1){
            stopTime = nutid.valueOf();
        }else{
            stopDate = new Date(events[i + 1].time);
            stopTime = stopDate.valueOf();
        }
        
        var time = stopTime - startTime;
        //console.log(time)

        gain += (time * 0.001) * intervalRate;         
    }

    
    return({gain : gain, nyrate : intervalRate});

}