let io;

var activeRooms = {}
var pingActiveRooms = {}
var fieldsData = {}

function setIo(app){
    io = require('socket.io')(app);
    connect()
}

function connect(){
    io.on('connection', socket => {
        socket.emit('identification');

        socket.on('changeRooms', data => {
            joinRoomIfAble(socket, data.roomId)
        })

        socket.on('sendLines', data => {
            sendLines(socket, data)
        })

        socket.on('triggerStart', data => {
            tryStartGameInRoom(socket, data)
        })
        
        socket.on('loss', data => {
            removePlayerFromGame(socket, data)
            saveField(socket, data)
        })

        socket.on('disconnecting', data=>{
            removePlayerFromGame(socket, data)
            
        })

        socket.on('pong', data => {
            saveField(socket, data)
        })

        socket.on('curse', data => {
            sendCurseRandomly(socket, data)
        })
    
    })

}

function joinRoomIfAble(socket, room) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.get(room)==undefined) {
        socket.emit('error', {msg:'This room does not exist.'})
    } else {
        socket.rooms.forEach(room => {socket.leave(room)});
        socket.join(room)
        socket.emit('roomConnect', {roomId: room})
    }
}

function sendCurseRandomly(socket, data) {
    let room = socket.rooms.values().next().value

    const clientsInRoom = Array.from(io.sockets.adapter.rooms.get(room));
    let curseType = data.type

    let socketMap = io.sockets['sockets'];

    let randomClient = undefined

    do {
        randomClient = socketMap.get(clientsInRoom[Math.floor(Math.random()*clientsInRoom.length)])
        if(randomClient != socket)
            randomClient.emit('curse', {type: curseType})
    } while(randomClient == socket)
}

function sendLines(socket, data) {
    let room = socket.rooms.values().next().value

    const clientsInRoom = Array.from(io.sockets.adapter.rooms.get(room));
    let lineQnt = data.qty

    let socketMap = io.sockets['sockets'];

    let randomClient = undefined

    do {
        randomClient = socketMap.get(clientsInRoom[Math.floor(Math.random()*clientsInRoom.length)])
        if(randomClient != socket)
            randomClient.emit('receiveLines', {qnt: lineQnt})
    } while(randomClient == socket)

    // clientsInRoom.forEach(client => {
        
    //     let clientSocket = socketMap.get(client)

    //     if (clientSocket != socket) {
    //         clientSocket.emit('receiveLines', {qnt: lineQnt})
    //     }
    // })
}

function tryStartGameInRoom(socket, data) {
    let room = socket.rooms.values().next().value
    if (activeRooms[room] && activeRooms[room].size > 1) {
        console.log('Game is already in progress')
        return
    }

    let socketMap = io.sockets['sockets'];

    const clientsInRoom = io.sockets.adapter.rooms.get(room);

    activeRooms[room] = new Set([...clientsInRoom])

    clientsInRoom.forEach(client => {
        let clientSocket = socketMap.get(client)
            clientSocket.emit('startGame', {clients: [...clientsInRoom]})
    })

    pingActiveRooms[room] = setInterval(gamePlayersHealthCheck, 2000, room)
    fieldsData[room] = {}

}

function gamePlayersHealthCheck(room) {
    if (!activeRooms[room] || activeRooms[room]==undefined) {
        clearInterval(pingActiveRooms[room])
    } 

    let socketMap = io.sockets['sockets'];
    const clientsInRoom = io.sockets.adapter.rooms.get(room);

    if(clientsInRoom==undefined)
        return

    clientsInRoom.forEach(client => {
        let clientSocket = socketMap.get(client)
        clientSocket.emit('ping', {fields: fieldsData[room]} )

    })


    
}

function removePlayerFromGame(socket, data) {
    let room = socket.rooms.values().next().value
    if(activeRooms[room]==undefined || activeRooms[room].size <= 1)
        return

    activeRooms[room].delete(socket.id)

    if (activeRooms[room].size == 1) {
        let socketMap = io.sockets['sockets'];
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        clientsInRoom.forEach(client => {
            let clientSocket = socketMap.get(client)

            if (client == activeRooms[room].values().next().value) {
                clientSocket.emit('win')
            } else {
                clientSocket.emit('gameOver', {winner: activeRooms[room].values().next().value})
            }
        })

        activeRooms[room] = undefined
    }
}

function saveField(socket, data) {
    let room = socket.rooms.values().next().value
    fieldsData[room][socket.id] = data.field
}

function distributeFields(socket, data) {
    let room = socket.rooms.values().next().value

    const clientsInRoom = io.sockets.adapter.rooms.get(room);

    let socketMap = io.sockets['sockets'];

    clientsInRoom.forEach(client => {
        
        let clientSocket = socketMap.get(client)

        if (clientSocket != socket) {
            clientSocket.emit('fieldUpdate', {user: socket, field: data.field})
        }
    })
}

module.exports = {setIo}