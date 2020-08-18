
function updateKapital(info_obj){
    return new Promise(function(resolve){

        var rate = parseInt(info_obj.game_stats.rate);
        var kapital;
        var lastupd = new Date(info_obj.lastupd);
        
        var time = lastupd.getTime() * 1000;
        kapital = rate * time;
        
        console.log(lastupd)
        resolve(kapital);     

        });
}

module.exports.updKapi = updateKapital;