var premiereLeagueDataDao = require('./../dao/premiere-league-data-dao');

exports.warmRDSCluster = async (event) => {
    console.log(JSON.stringify(event));
    let tries = 10;
    while (tries > 0){
        tries = tries - 1;
        try {
            let response = await premiereLeagueDataDao.getAllPlayers();
            console.log("Warming successful!")
            return response;
        } catch (error) {
            console.log("Warming RDS failed... trying again");
        }
    }
    console.log("Warming failed... hoping it will be sorted out by the extraction task");
    return;
}