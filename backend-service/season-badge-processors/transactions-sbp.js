var badgesDao = require('./../dao/badges-dao');
var transactionsDao = require('./../dao/transactions-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var BADGE_TYPE = require('./../util/badge-type');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let participants = JSON.parse(leagueDetails.participants.S);

        let allTransactions = await transactionsDao.getAllTransactionsForLeagueId(assignSeasonBadgesRequest.leagueId);
        console.log("Found " + allTransactions.Items.length + " number of attempted transactions for league " + assignSeasonBadgesRequest.leagueId);
        let successCount = {};
        let deniedCount = {};
        let mostAcceptedTransactions = {
            entryId: "",
            count: -1
        }
        let mostDeniedTransactions = {
            entryId: "",
            count: -1
        }
        for (let i in allTransactions.Items) {
            let transaction = allTransactions.Items[i];
            if (transaction.result.S === "a") {
                if (!successCount[transaction.leagueEntryId.S]) {
                    successCount[transaction.leagueEntryId.S] = 0;
                }
                successCount[transaction.leagueEntryId.S] = successCount[transaction.leagueEntryId.S] + 1;
                if (successCount[transaction.leagueEntryId.S] > mostAcceptedTransactions.count) {
                    mostAcceptedTransactions = {
                        entryId: transaction.leagueEntryId.S,
                        count: successCount[transaction.leagueEntryId.S]
                    }
                }
            } else {
                if (!deniedCount[transaction.leagueEntryId.S]) {
                    deniedCount[transaction.leagueEntryId.S] = 0;
                }
                deniedCount[transaction.leagueEntryId.S] = deniedCount[transaction.leagueEntryId.S] + 1;
                if (deniedCount[transaction.leagueEntryId.S] > mostDeniedTransactions.count) {
                    mostDeniedTransactions = {
                        entryId: transaction.leagueEntryId.S,
                        count: deniedCount[transaction.leagueEntryId.S]
                    }
                }
            }
        }
        let successEntry = participants.filter(participant => participant.entry_id.toString() === mostAcceptedTransactions.entryId.toString())[0];
        let deniedEntry = participants.filter(participant => participant.entry_id.toString() === mostDeniedTransactions.entryId.toString())[0];
        console.log("Most transactions accepted entry " + JSON.stringify(successEntry));
        console.log("Most transactions denied entry " + JSON.stringify(deniedEntry));
        let successBadge = await this._assignBadge(leagueDetails, successEntry, BADGE_TYPE.MOST_TRANSACTIONS_ACCEPTED, mostAcceptedTransactions.count, participants);
        let deniedBadge = await this._assignBadge(leagueDetails, deniedEntry, BADGE_TYPE.MOST_TRANSACTIONS_DENIED, mostDeniedTransactions.count, participants);

        return {
            "success": true,
        }
    },

    _assignBadge: async function(leagueDetails, entry, badgeType, badgeValue, participants){
        let badge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.leagueId.S + "-" + badgeType,
            entry.id.toString(),
            badgeType,
            {
                "year": leagueDetails.year.S,
                "value": badgeValue
            },
            participants
        );
        return badge;
    }
}