import 'react'
import {useState, useEffect, useRef} from 'react'
import {useApi} from '../utils/api.js'
import {useClerk} from '@clerk/clerk-react'

const Message = ({ text, sender, timestamp }) => {
    if (sender === '<System>') {
        return (
            <div className="message system-message">
                <div className="message-text">{text}</div>
            </div>
        );
    }
    return (
        <div className="message">
            <div className="message-info">
                <span className="sender">{sender}</span>
                <span className="timestamp">{timestamp}</span>
            </div>
            <div className="message-text">{text}</div>
        </div>
    );
};

export function Chat() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const {user} = useClerk()
    const ws = useRef(null)
    const {makeRequest} = useApi()
    const messagesEndRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState(0)

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await makeRequest("messages", { method: "GET" });
                const formattedMessages = data.map(element => ({
                    text: element.content,
                    timestamp: element.created_at,
                    sender: element.created_by,
                }));
                setMessages(formattedMessages);
            } catch (err) {
                console.error("Error with recieving the messages:", err.message || "Didn't manage to load the messages.");
            }
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        };

        loadMessages();
    }, []);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8000/api/ws");

        ws.current.onopen = () => {
            const newMessage = {
                sender: "<System>",
                text: `User ${user.username} entered the chat`,
                timestamp: null,
            };
            ws.current.send(JSON.stringify({
                "content": newMessage.text,
                "created_at": newMessage.timestamp,
                "created_by": newMessage.sender,
            }))
        }

        ws.current.onmessage = (event) => {
            const eventJSON = JSON.parse(event.data)
            console.log(eventJSON)
            if(eventJSON.count) {
                setOnlineUsers(eventJSON.count)
                return
            }
            //console.log(eventJSON)
            const newMessage = {
                text: eventJSON.content,
                timestamp: eventJSON.created_at,
                sender: eventJSON.created_by,
            };
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        const handleBeforeUnload = () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                const newMessage = {
                    sender: "<System>",
                    text: `User ${user.username} left the chat`,
                    timestamp: null,
                };
                ws.current.send(JSON.stringify({
                    "content": newMessage.text,
                    "created_at": newMessage.timestamp,
                    "created_by": newMessage.sender,
                }));
            }
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (ws.current) {
                ws.current.onopen = null;
                ws.current.onmessage = null;
                ws.current.close();
            }
        };
    }, []);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if(lastMessage && lastMessage.sender === user.username) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const timestamp = new Date().toLocaleTimeString();

        if(ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                "content": inputValue,
                "created_at": timestamp,
                "created_by": user.username,
            }))
        }
        else {
            console.log("Error: Server is close but you're trying to send request")
        }

        try {
            const data = await makeRequest("send-message", {
                method: "POST",
                body: JSON.stringify({
                    "content": inputValue,
                    "created_at": timestamp,
                    "created_by": user.username,
                }),
            })
        } catch (err) {
            setError(err.message || "Failed to send message.")
        } 

        setInputValue('')
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleOnlineUsers = () => {
        console.log("Online Users")
    }

    return (
        <div className="chat-wrapper">
            <div className="online-users">
                <button className="online-users-button" onClick={handleOnlineUsers}>Online Users ({onlineUsers})</button>
            </div>

            <div className="chat-container">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <Message key={index} text={msg.text} sender={msg.sender} timestamp={msg.timestamp} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-panel">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write message..."
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}
