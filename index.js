/* ----------------------- Server built by H.Ragul, B.Tech - IT ----------------------- */
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
});

let Rooms = {}
let availableRooms = []

io.on('connection', (socket) => {
    socket.emit('your-id', socket.id)
    console.log('New User Connected : ' + socket.id)
    console.log('Temp room arrya : ', availableRooms)
    console.log('Room with usernames : ', Rooms)
    console.log('----------------------------------------')

    /* Create room */
    socket.on('create-d-room', (roomid, uid, name) => {
        const newRoom = io.sockets.adapter.rooms.get(roomid)
        console.log(newRoom)
        if(newRoom !== undefined){
            io.to(uid).emit('d-re-enter')
        }
        else {
            socket.join(roomid)
            Rooms[roomid] = [name]
            availableRooms.push(roomid)
            console.log('Room object with new users : ', Rooms)
            console.log('Available Room with new rooms : ', availableRooms)
            console.log('----------------------------------------')
            io.to(uid).emit('d-entry-success')
        }
    })
    /* Create room */

    /* Join room */
    socket.on('join-room', (roomid, uid, name) => {
        const clients = io.sockets.adapter.rooms.get(roomid)
        if(clients !== undefined){
            var checker = roomid in Rooms       // Objec check
            if(checker){
                socket.join(roomid)
                Rooms[roomid].push(name)
                io.to(uid).emit('entry-success')
                console.log('Joined Room : ', roomid, ' & Player Name : ', Rooms[roomid])

                if(clients.size === 5){
                    console.log('Players size : ', clients.size)
                    var rivals = Rooms[roomid]
                    console.log(roomid, ' has reached 4 users')
                    var temp = []
                    for(var list of clients){
                        temp.push(list)
                    }
                    for(i=0; i<temp.length; i++){
                        if(i === 3){
                            io.to(temp[i]).emit('next-&-players', temp[0], rivals);
                        }
                        else {
                            io.to(temp[i]).emit('next-&-players', temp[i+1], rivals);
                        }
                    }
                    temp.length = 0
                    io.in(roomid).emit('start-game');
                    delete Rooms[roomid]
                }
            }
            else {
                io.to(uid).emit('room-full')
            }
            //before here : NOTE
        }
        else {
            io.to(uid).emit('re-enter')
        }
    })

    /* Passing cards */
    socket.on('pass-to-next', (ruid, card) => {
        io.to(ruid).emit('get-card', card)
    })

    /* Current player name */
    socket.on('current-player', (room, rivalName) => {     
        io.in(room).emit('currently-playing', rivalName);
    })

    /* Winner name */
    socket.on('i-won', (room, winner) => {
        io.in(room).emit('winner', winner);
    })

    /* Disconnecting */
    socket.on('disconnect', () => {
        console.log('Current Rooms size after single disconnect : ', socket.rooms.size)
        console.log('----------------------------------------')
        for(i=0; i<availableRooms.length; i++){
            const clients_g = io.sockets.adapter.rooms.get(availableRooms[i])
            try {
                if(clients_g.size < 5){
                    io.in(availableRooms[i]).emit('player-not-exist');
                }
            }
            catch(e){
                console.log(availableRooms[i] + ' is not having enough players')
                availableRooms.splice(availableRooms.indexOf(availableRooms[i]), 1)
                console.log('Current Rooms on socket (entire room) : ', socket.rooms.size)
                console.log('Current rooms on temp array : ', availableRooms)
                console.log('Current room object with users : ', Rooms)
                console.log('----------------------------------------')
            }
        }
    });
});

server.listen(process.env.PORT || 3000);

/* ----------------------- Server built by H.Ragul, B.Tech - IT ----------------------- */
