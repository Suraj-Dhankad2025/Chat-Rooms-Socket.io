import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function App() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [chatRoom, setChatRoom] = useState('');
    const [activityText, setActivityText] = useState('');
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);

    const socket = io('ws://localhost:3500');

    useEffect(() => {
        socket.on('message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        socket.on('activity', (typingName) => {
            setActivityText(`${typingName} is typing...`);

            clearTimeout(activityTimer);
            const activityTimer = setTimeout(() => {
                setActivityText('');
            }, 3000);
        });

        socket.on('userList', ({ users }) => {
            setUsers(users);
        });

        socket.on('roomList', ({ rooms }) => {
            setRooms(rooms);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (name && message && chatRoom) {
            socket.emit('message', { name, text: message });
            setMessage('');
        }
    };

    const enterRoom = (e) => {
        e.preventDefault();
        if (name && chatRoom) {
            socket.emit('enterRoom', { name, room: chatRoom });
        }
    };

    return (
        <div className="p-4">
            <form className="mb-4" onSubmit={sendMessage}>
                <input
                    type="text"
                    id="message"
                    placeholder="Message"
                    className="border p-2 mr-2"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Send
                </button>
            </form>
            <form className="mb-4" onSubmit={enterRoom}>
                <input
                    type="text"
                    id="name"
                    placeholder="Name"
                    className="border p-2 mr-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    id="room"
                    placeholder="Room"
                    className="border p-2 mr-2"
                    value={chatRoom}
                    onChange={(e) => setChatRoom(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Join Room
                </button>
            </form>
            <div className="mb-4">{activityText}</div>
            <ul className="mb-4">
                <em>Users in {chatRoom}:</em>
                {users.map((user, i) => (
                    <span key={i} className="mr-2">
                        {user.name}
                        {i !== users.length - 1 ? ',' : ''}
                    </span>
                ))}
            </ul>
            <ul>
                <em>Active Rooms:</em>
                {rooms.map((room, i) => (
                    <span key={i} className="mr-2">
                        {room}
                        {i !== rooms.length - 1 ? ',' : ''}
                    </span>
                ))}
            </ul>
            <ul className="mt-4">
                {messages.map((message, i) => (
                    <li
                        key={i}
                        className={`mb-2 ${
                            message.name === name ? 'bg-blue-200' : 'bg-gray-200'
                        } p-2 rounded`}
                    >
                        <span className="font-bold">{message.name}</span>: {message.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
