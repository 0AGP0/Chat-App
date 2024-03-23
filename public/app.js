const socket = io('https://chat-app-mfw8.onrender.com');

$(document).ready(() => {
    const msgInput = $('#message');
    const nameInput = $('#name');
    const chatRoom = $('#room');
    const activity = $('.activity');
    const usersList = $('.user-list');
    const roomList = $('.room-list');
    const chatDisplay = $('.chat-display');

    function sendMessage(e) {
        e.preventDefault();
        if (nameInput.val() && msgInput.val() && chatRoom.val()) {
            socket.emit('message', {
                name: nameInput.val(),
                text: msgInput.val()
            });
            msgInput.val('');
        }
        msgInput.focus();
    }

    function enterRoom(e) {
        e.preventDefault();
        if (nameInput.val() && chatRoom.val()) {
            socket.emit('enterRoom', {
                name: nameInput.val(),
                room: chatRoom.val()
            });
        }
    }

    $('.form-msg').submit(sendMessage);

    $('.form-join').submit(enterRoom);

    msgInput.keypress(() => {
        socket.emit('activity', nameInput.val());
    });

    socket.on('message', (data) => {
        activity.text('');
        const { name, text, time } = data;
        const li = $('<li>').addClass('post');
        if (name === nameInput.val()) li.addClass('post--left');
        if (name !== nameInput.val() && name !== 'Admin') li.addClass('post--right');
        if (name !== 'Admin') {
            li.html(`<div class="post__header ${name === nameInput.val()
                ? 'post__header--user'
                : 'post__header--reply'
                }">
                <span class="post__header--name">${name}</span> 
                <span class="post__header--time">${time}</span> 
                </div>
                <div class="post__text">${text}</div>`);
        } else {
            li.html(`<div class="post__text">${text}</div>`);
        }
        chatDisplay.append(li);

        chatDisplay.scrollTop(chatDisplay.prop('scrollHeight'));
    });

    let activityTimer;
    socket.on('activity', (name) => {
        activity.text(`${name} is typing...`);

        // Clear after 3 seconds 
        clearTimeout(activityTimer);
        activityTimer = setTimeout(() => {
            activity.text('');
        }, 3000);
    });

    socket.on('userList', ({ users }) => {
        showUsers(users);
    });

    socket.on('roomList', ({ rooms }) => {
        showRooms(rooms);
    });

    function showUsers(users) {
        usersList.text('');
        if (users) {
            usersList.html('<em>Users in ' + chatRoom.val() + ':</em>');
            users.forEach((user, i) => {
                usersList.append(' ' + user.name);
                if (users.length > 1 && i !== users.length - 1) {
                    usersList.append(',');
                }
            });
        }
    }

    function showRooms(rooms) {
        roomList.text('');
        if (rooms) {
            roomList.html('<em>Active Rooms:</em>');
            rooms.forEach((room, i) => {
                roomList.append(' ' + room);
                if (rooms.length > 1 && i !== rooms.length - 1) {
                    roomList.append(',');
                }
            });
        }
    }
});
