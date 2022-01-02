const  express = require('express');
var PORT = process.env.PORT || 3000
const app = express()
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const striptags = require('striptags');
const { Server } = require("socket.io");

const io = new Server(server)


let users = []

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
/**
 *Cette fonction permet d'accepter un utilisateur
 * en vérifiant si l'utilisateur est déjà présent dans la liste 
 * ou pas
 */ 
const acceptUser = function(_users, username){
   let response = null;

    _users.forEach(elt = (elt) => {

        if (elt.name == username){
            response = true;
        }
       else {
            response = false;
       }
    })
       ; 
    return response;
}


const getDataChat = (destSocket){
        let dataChat;

        if (destSocket == 'person0'){
            dataChat = 'users';
        }
        else{
            dataChat = destSocket;
        }

    return dataChat;
    
}

app.use(express.static(path.join(__dirname + '/views')));

app.get('/', (req, res) => {
   console.log(__dirname)
  res.sendFile(__dirname + '/views' +  '/index.html')
});
/**
 *Récupérer les valeurs de la requête post
 */
app.post('/', function(req, res) {
        var user_name = req.body.username;
        res.end("yes");
    });
const usersname = (_users) => {
    u = []
    _users.forEach(elt = (elt) => {
        u.push(elt.name);
    })
        return u;

 }

const socketsID = (_users) => {
    u = []
    _users.forEach(elt = (elt) => {
        u.push(elt.socketId);
    })
        return u;
}
// Connection de l'utilisateur
let time = 5000;
io.on('connection', (socket) => { 
    console.log(users[socket.id]);
    console.log(socket.id + 'a user connected');
    setTimeout(() =>{
        console.log("oui")
     
    socket.on('username' , (username)=>{
        username = username.trim();
        if (!acceptUser(users, striptags(username))){
            k = {}
            k['name']  = striptags(username);
            k['socketId'] = socket.id;
            usernameForfilter = username;
            socket.join('users', (users));
            socket.emit('acceptUser', usersname(users), socketsID(users));
            users.push(k)
            socket.to("users").emit('newUser', k, usersname(users));
            socket.to("users").emit("newMessage", username);

    }
        else{
            socket.emit('refusedUser', (username));
        }
    }
    ), time});

    /**
     * Reception de message côté client pour le repartager 
     */
    socket.on('newGroupMessage', (text, destSocket) => {
        let dataChat = getDataChat(destSocket);
        text = striptags(text.trim());
        let user;
        users.forEach(elt = (elt) => {
            if (elt.socketId == socket.id){
            user = elt.name;
        }})
        if (text != ''){
            socket.to(dataChat).emit('newMessageOfGroup', text, user, socket.id, dataChat);
        }
    })

    /**
     *
     **/
    socket.on('startWritting', (destSocket)=>{
        let dataChat = getDataChat(destSocket);
        let user;
        users.forEach(elt = (elt) => {
            if (elt.socketId == socket.id){
            user = elt.name;
        }})
        socket.to(dataChat).emit('usersWritting', user);
    })
    
    socket.on('stopWritting', (destSocket)=>{
        let dataChat;

        if (destSocket == 'person0'){
            dataChat = 'users';
        }
        else{
            dataChat = destSocket;
        }
        socket.to(dataChat).emit('usersStopWritting');
    })
    socket.on('disconnect', ()=>{
        console.log(socket.id + 'vient de se déconnecter');
        users = users.filter(elt => elt.socketId != socket.id);
        socket.to("users").emit("leftUsers", usersname(users), socket.id);
        console.log(users);
    });
})


server.listen(PORT, () => {
  
  console.log(`Example app listening at http://localhost:${PORT}`)
});




















