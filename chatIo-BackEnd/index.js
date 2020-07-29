'use strict'

const app = require('express')();
const serverHttp = require('http').Server(app);
const io = require('socket.io')(serverHttp);
const cors = require('cors');
let randomColor = require('randomcolor');
const router = require('./router');


const myMessagges = [];
let users = [];
let connnections = [];
app.use(cors())
app.use(router);
io.on('connection', (socket) => {
    console.log('New user connected');
    connnections.push(socket);
    //initialize a random color for the socket
    let color = randomColor();
    socket.username = 'Anonymous';
    socket.color = color;
    //listen on change_username
    socket.on('change_username', data => {
        socket.id = data.id;
        socket.username = data.username;
        users.push({ id: data.id, username: socket.username, color: socket.color });
        updateUsernames();
        updateMessage();
    })

    socket.on('send-message', (data) => {
        myMessagges.push(data);
        socket.emit('text.event', myMessagges);
        updateMessage();
    });

    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username,color: socket.color});
    })

    //update Usernames in the client
    const updateUsernames = () => {
        io.sockets.emit('get users', users)
    }
    //update message
    const updateMessage = () => {
        console.log(myMessagges);
        io.sockets.emit('text-event', myMessagges)
    }
    //listen on typing
    socket.on('typing', data => {
        socket.emit('typing.event', { username: data.username });   
        socket.broadcast.emit('typing', { username: data.username })
    });
    //Disconnect
    socket.on('disconnect', data => {

        if (!socket.username)
            return;
        //find the user and delete from the users list
        let user = undefined;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {
                user = users[i];
                break;
            }
        }
        users = users.filter(x => x !== user);
        //Update the users list
        updateUsernames();
        connnections.splice(connnections.indexOf(socket), 1);
    })
});


serverHttp.listen(process.env.PORT || 5151, () => console.log(`Server has started.`));
