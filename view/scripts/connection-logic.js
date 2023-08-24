import {increaseEnemyLines, 
        startGame,
        getField,
        createOtherFields, 
        renderOtherPlayersFields,
        increasePowerup,
        curse
    } from "./game-logic.js"

const socket = io();

socket.on('identification', () =>{
    console.log('connected.')
    document.getElementById('room_id').textContent = socket.id;
    document.getElementById('user_id').textContent = socket.id;
})

socket.on('error', (data) => {
    alert(data.msg)
})

socket.on('roomConnect', (data) => {
    document.getElementById('room_id').textContent = data.roomId;
})

socket.on('receiveLines', (data) => {
    increaseEnemyLines(data.qnt)
})

socket.on('startGame', (data) => {
    let usersPlaying = data.clients

    createOtherFields(usersPlaying)

    startGame()
})

socket.on('gameOver', (data) => {
    console.log('Game is over, ' + data.winner + ' won.')
})

socket.on('win', (data) => {
    alert('YOU WON!!!111!!')
})

socket.on('ping', (data) => {
    socket.emit('pong', {field: getField()})

    let fields = data.fields


    increasePowerup()
    if (Object.keys(data.fields).length != 0)
        delete fields[socket.id]
        renderOtherPlayersFields(data.fields)
    
})

socket.on('curse', (data) => {
    curse(data.type)
})


document.getElementById('joinBtn').addEventListener('click', joinRoom)

function joinRoom() {
    let roomId = document.getElementById('target_room').value
    socket.emit('changeRooms', {roomId: roomId})
}

function sendLines(qnt) {
    socket.emit('sendLines', {qty: qnt})
}

function requestStart() {
    socket.emit('triggerStart')
}

function notifyLoss() {
    socket.emit('loss', {field: getField()})
}

function sendCurse(type) {
    socket.emit('curse', {type: type})
}

export {sendLines, requestStart, notifyLoss, sendCurse}

