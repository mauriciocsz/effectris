const express = require('express');
const app = new express();
const path = require('path');

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use("/",express.static(path.resolve(__dirname+'/view'),{index:'_'}));

router.get('/', (req,res) =>{
    res.sendFile(path.resolve( __dirname+'/view/game.html'))
})


app.use(router)


var http = require('http').createServer(app);

http.listen(8080);

console.log("Running")

const socket = require('./socketio/connection')
socket.setIo(http)