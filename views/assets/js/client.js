var socket = io();
let userNameForFilter = '';
let username = document.getElementById("usernameDef");
let peoples = document.getElementById("peoples"); 
let users = document.getElementById("list");
let discussion = document.getElementById("discussion");
let write = document.getElementById("writting");
let user = document.getElementById("username");
let infoPersonTop = document.getElementById("infoPersonTop");
let usernameDef = null;
let loader = document.getElementById("load");
let conversationStart = document.getElementById("conversationStart");
let inputText = document.getElementById("inputText");
user.addEventListener('submit', (event)=>{
    event.preventDefault();
    if ((username.value) != ''){

    socket.emit('username' , username.value);
    userNameForFilter = username.value;
    username.value = '';
    username.classList.add('hidden');
    loader.classList.remove('hidden');
}
}
);
/**
 * Filtrage des utilisateurs
 **/
 const filterUsers = (users) => {
    k = []
    users.forEach( elt = (elt) => {
        if (elt != userNameForFilter){
            k.push(elt);
        }
    })
    return k;
 }

 /**
  * Affichage du nombre de personne
  */
const updateUser = (_username)=>{
    liste = "";
    _username.forEach(elt = (elt) => {
        liste = liste + "<li>" + elt + "</li>";
    })
    users.innerHTML = liste;
    discussion.innerHTML = "Discussion générale (" + _username.length + ")";
    infoPersonTop.innerHTML = "Discussion générale (" + _username.length + ")";

}

socket.on('newMessage', (username) =>{
    conversationStart.insertAdjacentHTML('beforeend',"<div class=\"conversation-start\"> <span> Bienvenue " + username + "</span></div>");
})

const setFriends = (users, socketsId) => {
let i = 0;
console.log(users);
console.log(socketsId);
for (i = 0; i < users.length; i++) {
    k = {}
    k['name'] = users[i];
    k['socketId'] = socketsId[i];
    addNewUser(k);
}
}

socket.on('leftUsers', (users, socketID) => {
    let personOnListPerson = document.querySelector('.chat[data-chat=' + socketID +']');
    let person = document.querySelector('.person[data-chat=' + socketID  + ']');
    if (person != null){
        person.remove();
    }
    if (personOnListPerson != null){
        personOnListPerson.remove();
    }
    k = filterUsers(users);
    console.log(users);
    updateUser(k);
})
socket.on('acceptUser', (_username, socketsId)=>{
    setFriends(_username, socketsId);
    updateUser(_username);
    closeModal();
});
 
   
let isWritting = false;
let time = null;
inputText.addEventListener('keydown', (event)=>{
    if (event.keyCode == 13){
        let destSocket = chat.person;
        sendMessage(destSocket)
    }else{
        clearTimeout(time);
        
        if (!isWritting){
                isWritting = true;
                console.log("isWritting");
                socket.emit('startWritting', chat.person);
        }
        time = setTimeout(()=>{
            isWritting = false;
            console.log("StopWriting");
            socket.emit('stopWritting', chat.person);
        }, 1000);
    }
});


socket.on('newUser', (user1, users) => {
    k = filterUsers(users);
    updateUser(k);
    console.log(k);
    addNewUser(user1);
});


socket.on('usersWritting', (user) => {
    write.classList.remove('none');
    write.innerHTML =  user + " est entrain d'écrire";
})

socket.on('usersStopWritting', () =>{ 
    write.classList.add('none');
})
/**
 * Envoie d'un message 
 * récupération d'un message grâce à inputText.value
 */
const sendMessage = (destSocket) => {
    let text = inputText.value.trim();
    if (text != ''){
        clearTimeout(time);
       socket.emit('newGroupMessage', text, destSocket);
       conversationStart = document.querySelector('.chat[data-chat='+chat.person+']');
       conversationStart.insertAdjacentHTML('beforeend',"<div class=\"bubble name me\">" + text  + "</div> ");
       inputText.value = '';
       isWritting = false; 
       console.log("StopWriting");
    }

}
/* Affichage de message venant d'un expéditeur */
socket.on('newMessageOfGroup', (text, user, destSocket, dataChat) => {
    let conversation;
    if (dataChat != 'users'){
        conversation = document.querySelector('.chat[data-chat='+destSocket+']');
    }
    else{
        conversation = conversationStart;
    }
    console.log(destSocket);
       conversation.insertAdjacentHTML('beforeend', "<div class=\"bubble name you\">" + "<span class=\"username\">" + user +  "</span>" + text + "</div>");

})
// Affichage d'un nouvel utilisateur

const addNewUser = (user) => {
    //input = input[input.length - 1]
    // Mettre la derniere discussion à la fin de tous les chats
    let  people ="<li class=\"person\" data-chat=\"" + user.socketId+"\">"+
                    "<img src=\"https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/thomas.jpg\" alt=\"\"/>"+
                    "<span class=\"name\">"+user.name+"</span>" + 
                    "<span class=\"time\">2:09</span></br>" +
                    "<span class=\"preview\">Bienvenue</span>" +
                "</li>";
    friends.list.insertAdjacentHTML('beforeend',people);
    let input = chat.container.querySelectorAll('.chat');
    input = input[input.length  - 1];
    console.log(input);
    people = "<div class=\"chat\" data-chat=\"" + user.socketId + "\"></div>";
    input.insertAdjacentHTML('afterend', people);
    updateJs();
    
}



socket.on('refusedUser', (_username)=>{
 loader.classList.add('hidden');
 username.classList.remove('hidden');
 username.setAttribute('placeholder', `le pseudo ${_username} est déjà pris`
 )})
