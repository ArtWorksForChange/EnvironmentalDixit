const { response } = require("express");
const express = require("express");
const mongoose = require('mongoose');

const GameObject = require("./util/Game");

mongoose.connect('mongodb+srv://ehrman:dixit@cluster0.jfqke.mongodb.net/GameData?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("returnOriginal", false);

//for Heroku
const PORT = process.env.PORT || 5000;


let ids = [];
let games = [];



//Game Data schema
const gameData = new mongoose.Schema({
    gameID: String,
    playerCount: Number,
    cardCount: Number,
    cardOrder: [Number],
    gameState: String,
    players: [{ name: String, score: Number, cards: [Number], handCount: Number, host: Boolean }],
    roundCount: Number,
    turnOrder: [Number],
    roundData: { playersActed: Number, clue: String, cardArray: [{ playerIndex: Number, cardIdentifier: Number, votes: Number, voterIndexes: [Number] }] }
});

const Game = mongoose.model('Game', gameData);

//Mongoose Connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//     // we're connected!
// });

//use the application off of express.
const app = express();

//middleWare for post and pull
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//use files in public page
app.use(express.static(__dirname + '/public'));


//define the route for "/"
app.get("/", (request, response) => {
    //show this file when the "/" is requested
    response.sendFile(__dirname + "/index.html");
});

//Get Functions
app.get("/game/pull/:gameid/:playerIndex", (req, res) => {
    let gameId;

    switch (req.params.gameid) {
        case "new":
            gameId = ids[ids.length - 1];

            // Game.find({ gameID: gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);
            //     //TODO:: Instead of this emit a web socket broadcast

            //     // res.send(game[0]);
            // });


            break;

        default:
            gameId = req.params.gameid;
            // Game.find({ gameID: gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);
            //     //TODO:: Instead of this emit a web socket broadcast
            //     res.send(game[0]);
            // });
            break;

    }
  
    let tempArray = games.filter(game => game.gameID == gameId);
    
   
    let game= tempArray[0];
    
    let data = game.sendData(req.params.playerIndex);

    res.send(data);

});


//TODO: Create checks to see if game exists already
//POST Functions
app.post("/game/new", (req, res) => {

    _gameID = generateID();

    let game = new GameObject(_gameID, req.body.playerName, 45);
    games.push(game);

    console.log(_gameID);
    ids.push(_gameID);

    // const _game = new Game({ gameID: _gameID, playerCount: 1, cardCount: 45, cardOrder: [], gameState: "join", players: [{ name: req.body.playerName, score: 0, handCount: 0, cards: [], host: true }], roundCount: 0, turnOrder: [0], roundData: { playersActed: 0, clue: "", cardArray: [] } });

    // _game.save(function (err) {
    //     if (err) return res.sendStatus(500);
    // });
    //TODO:: Instead of this emit a web socket broadcast
    res.sendStatus(200);

});
app.put("/game/:funct", (req, res) => {
    let funct = req.params.funct;
    let game = games.filter(tempGame => tempGame.gameID == req.body.gameId)[0];


    switch (funct) {
        case "start":

            // Game.find({ gameID: req.body.gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);

            //     _gameState = game[0].gameState = "mainCard";

            //     Game.findOneAndUpdate({ gameID: req.body.gameId }, { gameState: _gameState, players: req.body.players, turnOrder: req.body.playerOrder, cardOrder: req.body.cardOrder }, function (err, game) {
            //         if (err) return res.sendStatus(500);
            //         //TODO:: Instead of this emit a web socket broadcast
            //         res.sendStatus(200);
            //     });
            // });
           
            game.startGame("");
    
            break;
        case "clue":
            // Game.find({ gameID: req.body.gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);

            //     let _gameState = game[0].gameState = "fakeCards";

            //     //removes clue card from players hand
            //     let _players = game[0].players;
            //     _players[req.body.playerIndex].handCount = _players[req.body.playerIndex].handCount - 1;

            //     _players[req.body.playerIndex].cards = _players[req.body.playerIndex].cards.filter(card => card != req.body.roundData.cardArray[0].cardIdentifier);


            //     Game.findOneAndUpdate({ gameID: req.body.gameId }, { gameState: _gameState, roundData: req.body.roundData, players: _players }, function (err, game) {
            //         if (err) return res.sendStatus(500);
            //         //TODO:: Instead of this emit a web socket broadcast
            //         res.sendStatus(200);
            //     });

            // });

            game.recieveClue(req.body.playerIndex,req.body.roundData.cardArray[0].cardIdentifier,req.body.roundData.clue);

            break;
        case "fake":
            // Game.find({ gameID: req.body.gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);

            //     let roundData = game[0].roundData;
            //     let _gameState = "fakeCards";

            //     roundData.playersActed++;
            //     let cardObject = { playerIndex: req.body.playerIndex, cardIdentifier: req.body.cardIdentifier, votes: 0 };
            //     roundData.cardArray.push(cardObject);

            //     if (roundData.playersActed == game[0].playerCount) {

            //         _gameState = "vote";
            //         roundData.playersActed = 0;
            //     }

            //     let _players = game[0].players;
            //     _players[req.body.playerIndex].handCount = _players[req.body.playerIndex].handCount - 1;
            //     _players[req.body.playerIndex].cards = _players[req.body.playerIndex].cards.filter(card => card != req.body.cardIdentifier);


            //     Game.findOneAndUpdate({ gameID: req.body.gameId }, { gameState: _gameState, roundData: roundData, players: _players }, function (err, game) {
            //         if (err) return console.error(err);
            //         //TODO:: Instead of this emit a web socket broadcast
            //         res.sendStatus(200);
            //     });

               
            // });

            game.recieveFake(req.body.playerIndex,req.body.cardIdentifier);
            break;
        case "vote":
            // Game.find({ gameID: req.body.gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);

            //     let roundData = game[0].roundData;
            //     let _gameState = "vote";

            //     roundData.playersActed++;

            //     roundData.cardArray[req.body.cardIndex].votes++;
            //     roundData.cardArray[req.body.cardIndex].voterIndexes.push(req.body.playerIndex);
            //     let _players;
            //     if (roundData.playersActed == game[0].playerCount - 1) {
            //         //Determin scores with game state information
            //         _players = determineScores(game[0].players, game[0].roundData);
            //         _gameState = "endDisplay";
            //     } else {
            //         _players = game[0].players;
            //     }

            //     Game.findOneAndUpdate({ gameID: req.body.gameId }, { players: _players, gameState: _gameState, roundData: roundData }, function (err, game) {
            //         if (err) return res.sendStatus(500);
            //         //TODO:: Instead of this emit a web socket broadcast
            //         res.sendStatus(200);
            //     });

               
            // });

            game.recieveVote(req.body.playerIndex,req.body.cardIndex);
            break;
        case "next":
            // Game.find({ gameID: req.body.gameId }, function (err, game) {

            //     if (err) return res.sendStatus(404);

            //     _gameState = game[0].gameState = "mainCard";
            //     _roundCount = game[0].roundCount + 1;

            //     Game.findOneAndUpdate({ gameID: req.body.gameId }, { gameState: _gameState, roundCount: _roundCount, players: req.body.players, cardOrder: req.body.cardOrder }, function (err, game) {
            //         if (err) return res.sendStatus(500);
            //         //TODO:: Instead of this emit a web socket broadcast
            //         res.sendStatus(200);
            //     });
            // });

            game.newRound();
            break;
        case "join":
            // let _playerCount = 0;
            // let _player = { name: req.body.playerName, score: 0, handCount: 0, cards: [], host: false };

            // let _players = [];

            // Game.find({ gameID: req.body.gameId }, function (err, game) {
            //     if (err) return res.sendStatus(404);

            //     _players = game[0].players;

            //     _playerCount = game[0].playerCount;


            //     if (_playerCount < 7) {
            //         _players.push(_player);
            //         _playerCount++;


            //         Game.findOneAndUpdate({ gameID: req.body.gameId }, { playerCount: _playerCount, players: _players }, function (err, game) {
            //             if (err) return res.sendStatus(500);

            //             //TODO:: Instead of this emit a web socket broadcast
            //             res.sendStatus(200);
            //         });

            //     } else {
            //         //TODO:: Instead of this emit a web socket broadcast
            //         res.sendStatus(404);
            //     }

            // });

            game.addPlayer(req.body.playerName);
            break;
    }
    res.sendStatus(200);
});
//Generates a unique string of four capital letters
function generateID() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    let id = "";
    let validId = false;

    while (!validId) {
        while (id.length < 4) {
            let index = Math.floor(Math.random() * alphabet.length);

            id += alphabet[index];

        }
        validId = ids.indexOf(id) == -1;
    }


    //TODO::// Check and add to a id list so there are no double ids
    ids.push(id);

    return id;

}
//returns players array with updated scores
function determineScores(players, roundData) {
    //find host card
    let hostIndex = roundData.cardArray[0].playerIndex;
    //If host fails
    if (roundData.cardArray[0].votes == 0 || roundData.cardArray[0].votes == players.length - 1) {
        for (let i = 0; i < players.length; i++) {
            //add other score points
            if (i != hostIndex) {
                players[i].score += 2;
                for (let j = 1; j < roundData.cardArray.length; j++) {
                    if (roundData.cardArray[j].playerIndex == i) {
                        players[i].score += roundData.cardArray[j].votes;
                    }
                }
            }
        }
    } else {
        players[hostIndex].score += 3;
        let voterIndexes = roundData.cardArray[0].voterIndexes;
        //Everyone who voted for correct card also gets points
        for (let i = 0; i < voterIndexes.length; i++) {
            players[voterIndexes[i]].score += 3;

        }
        //add other score points
        for (let i = 0; i < players.length; i++) {
            if (i != hostIndex) {
                for (let j = 1; j < roundData.cardArray.length; j++) {
                    if (roundData.cardArray[j].playerIndex == i) {
                        players[i].score += roundData.cardArray[j].votes;
                    }
                }
            }
        }

    }
    return players;
};

//start the server
app.listen(PORT);

console.log(`server at http://localhost:${PORT}  ...`);