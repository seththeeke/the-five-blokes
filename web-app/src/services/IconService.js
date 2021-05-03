// Gameweek
import zeroGoalGameweek from "../img/0-goals.png";
import fiveGoalGameweek from "../img/5-goals.png";
import tenGoalGameweek from "../img/10-goals.png";
import fifteenGoalGameweek from "../img/15-goals.png";
import zeroAssistGameweek from "../img/0-assists.png";
import fiveAssistGameweek from "../img/5-assists.png";
import tenAssistGameweek from "../img/10-assists.png";
import fifteenAssistGameweek from "../img/15-assists.png";
import tenPointBench from "../img/10-point-bench.png";
import fifteenPointPlayer from "../img/15-point-player.png";
import twentyPointPlayer from "../img/20-point-player.png";
import twentyFivePointPlayer from "../img/25-point-player.png";
import negativeGameweekPlayer from "../img/negative-gameweek-player.png";
import participant from "../img/participant.png";
import fiftyPointGameweek from "../img/50.png";
import seventyFivePointGameweek from "../img/75.png";
import oneHundredPointGameweek from "../img/100.png";
import gameweekWinner from "../img/gameweek-winner.png";
import gameweekLoser from "../img/thumbs-down-gameweek.png";
import leagueLeader from "../img/league-leader.png";
import leagueLoser from "../img/gameweek-loser.png";
import gameweekMVP from "../img/gameweek-mvp-player.png";
// Season
import leagueChampion from "../img/league-champion.png";
import seasonLoser from "../img/season-loser.png";
import goldenBoot from "../img/golden-boot-season-winner.png";
import goldenGloveSeason from "../img/golden-glove-season.png";
import mostRedCards from "../img/most-red-cards-season.png";
import mostTransactionsDenied from "../img/most-transactions-denied-season.png";
import mostTransactions from "../img/most-transactions-season.png";
import mostYellowCards from "../img/most-yellow-cards-season.png";
import playmakerOfTheSeason from "../img/playmaker-of-the-season.png";
import seasonLVP from "../img/season-lvp-player.png";
import seasonMVP from "../img/season-mvp-player.png";
import twoHundredPointPlayer from "../img/200-point-player.png";
import twoHundredFiftyPointPlayer from "../img/250-point-player.png";
import threeHundredPointPlayer from "../img/300-point-player.png";
import twelveFiftyPointSeason from "../img/1250-point-season.png";
import fifteenHundredPointSeason from "../img/1500-point-season.png";
import seventeenFiftyPointSeason from "../img/1750-point-season.png";
import twoThousandPointSeason from "../img/2000-point-season.png";
import dreamteamPlayer from "../img/dreamteam-player.png";

class IconService {
    constructor() {
      this.gameweekIcons = [
        {
          icon: zeroGoalGameweek,
          badgeType: "0 Goal Gameweek",
          description: "Given to any player who scores 0 goals in a gameweek"
        },
        {
          icon: fiveGoalGameweek,
          badgeType: "5+ Goal Gameweek",
          description: "Given to any player who scores at least 5 goals in a gameweek"
        },
        {
          icon: tenGoalGameweek,
          badgeType: "10+ Goal Gameweek",
          description: "Given to any player who scores at least 10 goals in a gameweek"
        },
        {
          icon: fifteenGoalGameweek,
          badgeType: "15+ Goal Gameweek",
          description: "Given to any player who scores at least 15 goals in a gameweek"
        },
        {
          icon: zeroAssistGameweek,
          badgeType: "0 Assist Gameweek",
          description: "Given to any player who provides 0 assists in a gameweek"
        },
        {
          icon: fiveAssistGameweek,
          badgeType: "5+ Assist Gameweek",
          description: "Given to any player who provides at least 5 assists in a gameweek"
        },
        {
          icon: tenAssistGameweek,
          badgeType: "10+ Assist Gameweek",
          description: "Given to any player who provides at least 10 assists in a gameweek"
        },
        {
          icon: fifteenAssistGameweek,
          badgeType: "15+ Assist Gameweek",
          description: "Given to any player who provides at least 15 assists in a gameweek"
        },
        {
          icon: tenPointBench,
          badgeType: "10+ Point Bench Player",
          description: "Given to any player who has a bench player earn at least 10 points in a gameweek"
        },
        {
          icon: fifteenPointPlayer,
          badgeType: "15+ Point Gameweek Player",
          description: "Given to any player who has a player earn at least 15 points in a gameweek"
        },
        {
          icon: twentyPointPlayer,
          badgeType: "20+ Point Gameweek Player",
          description: "Given to any player who has a player earn at least 20 points in a gameweek"
        },
        {
          icon: twentyFivePointPlayer,
          badgeType: "25+ Point Gameweek Player",
          description: "Given to any player who has a player earn at least 25 points in a gameweek"
        },
        {
          icon: gameweekMVP,
          badgeType: "Gameweek MVP",
          description: "Given to the player who owns the player who earned the most points in a gameweek"
        },
        {
          icon: negativeGameweekPlayer,
          badgeType: "Negative Gameweek Player",
          description: "Given to any player who has a player earn negative points in a gameweek"
        },
        {
          icon: fiftyPointGameweek,
          badgeType: "50+ Point Gameweek",
          description: "Given to any player who earns at least 50 points in a gameweek"
        },
        {
          icon: seventyFivePointGameweek,
          badgeType: "75+ Point Gameweek",
          description: "Given to any player who earns at least 75 points in a gameweek"
        },
        {
          icon: oneHundredPointGameweek,
          badgeType: "100+ Point Gameweek",
          description: "Given to any player who earns at least 100 points in a gameweek"
        },
        {
          icon: gameweekWinner,
          badgeType: "Gameweek Winner",
          description: "Given to the player who earns the most points in a gameweek"
        },
        {
          icon: gameweekLoser,
          badgeType: "Gameweek Loser",
          description: "Given to the player who earns the least points in a gameweek"
        },
        {
          icon: leagueLeader,
          badgeType: "League Leader",
          description: "Given to the player who is in 1st place at the end of the gameweek"
        },
        {
          icon: leagueLoser,
          badgeType: "League Loser",
          description: "Given to the player who is in last place at the end of the gameweek"
        }
      ];
      this.seasonIcons = [
        {
          icon: leagueChampion,
          badgeType: "League Champion",
          description: "Given to any player who wins a league"
        },
        {
          icon: participant,
          badgeType: "Participant",
          description: "Given to any player who participates in a league"
        },
        {
          icon: seasonLoser,
          badgeType: "Season Loser",
          description: "Given to any player who gets last place in a league"
        },
        {
          icon: goldenBoot,
          badgeType: "Golden Boot Winner",
          description: "Given to any player who owns a golden boot winner"
        },
        {
          icon: goldenGloveSeason,
          badgeType: "Golden Glove Winner",
          description: "Given to any player who owns a golden glove winner"
        },
        {
          icon: playmakerOfTheSeason,
          badgeType: "Playmaker of the Season Winner",
          description: "Given to any player who owns a playmaker of the season winner"
        },
        {
          icon: seasonMVP,
          badgeType: "Season MVP",
          description: "Given to the player who owns the player who earned the most points in a season"
        },
        {
          icon: seasonLVP,
          badgeType: "Season LVP",
          description: "Given to the player who owns the player who earned the least points in a season"
        },
        {
          icon: mostYellowCards,
          badgeType: "Most Goals",
          description: "Given to the player who owns the players who scored the most goals in a season"
        },
        {
          icon: mostRedCards,
          badgeType: "Most Assists",
          description: "Given to the player who owns the players who created the most assists in a season"
        },
        {
          icon: mostYellowCards,
          badgeType: "Most Clean Sheets",
          description: "Given to the player who owns the players who had the most clean sheets in a season"
        },
        {
          icon: mostRedCards,
          badgeType: "Most Bonus Points",
          description: "Given to the player who owns the players who earned the most bonus points in a season"
        },
        {
          icon: mostYellowCards,
          badgeType: "Most Yellow Cards",
          description: "Given to the player who owns the players who earned the most yellow cards in a season"
        },
        {
          icon: mostRedCards,
          badgeType: "Most Red Cards",
          description: "Given to the player who owns the players who earned the most red cards in a season"
        },
        {
          icon: mostTransactions,
          badgeType: "Most Transactions",
          description: "Given to the player who completes the most successful transactions in a season"
        },
        {
          icon: mostTransactionsDenied,
          badgeType: "Most Transactions Denied",
          description: "Given to the player who has the most transactions denied in a season"
        },
        {
          icon: twoHundredPointPlayer,
          badgeType: "200+ Point Season Player",
          description: "Given to the player who picks a player who earns at least 200 points in a season"
        },
        {
          icon: twoHundredFiftyPointPlayer,
          badgeType: "250+ Point Season Player",
          description: "Given to the player who picks a player who earns at least 250 points in a season"
        },
        {
          icon: threeHundredPointPlayer,
          badgeType: "300+ Point Season Player",
          description: "Given to the player who picks a player who earns at least 300 points in a season"
        },
        {
          icon: twelveFiftyPointSeason,
          badgeType: "1250+ Point Season",
          description: "Given to the player who earns at least 1250 points in a season"
        },
        {
          icon: fifteenHundredPointSeason,
          badgeType: "1500+ Point Season",
          description: "Given to the player who earns at least 1500 points in a season"
        },
        {
          icon: seventeenFiftyPointSeason,
          badgeType: "1750+ Point Season",
          description: "Given to the player who earns at least 1750 points in a season"
        },
        {
          icon: twoThousandPointSeason,
          badgeType: "2000+ Point Season",
          description: "Given to the player who earns at least 2000 points in a season"
        },
        {
          icon: dreamteamPlayer,
          badgeType: "Dreamteam Player",
          description: "Given to the player who picks a player who earns at spot on the dreamteam of the year"
        }
      ]
      this.allIcons = [];
      this.allIcons = this.allIcons.concat(this.gameweekIcons);
      this.allIcons = this.allIcons.concat(this.seasonIcons);
    }

    getAllIcons(){
      return this.allIcons;
    }

    getGameweekIcons(){
      return this.gameweekIcons;
    }

    getSeasonIcons(){
      return this.seasonIcons;
    }

    getIconByBadgeType(badgeType){
      if (!this.badgeCache){
        this.badgeCache = {};
        for (let i in this.allIcons) {
          this.badgeCache[this.allIcons[i].badgeType] = this.allIcons[i];
        }
      }
      return this.badgeCache[badgeType];
    }
  
  }
  
  export default IconService;