import 'react'
import {useState, useEffect, useRef, useCallback} from 'react'
import {useApi} from '../hooks/useApi.js'
import {useClerk} from '@clerk/clerk-react'
import Message from '../components/Message.jsx'
import User from '../components/User.jsx'
import {useWebSocket} from '../hooks/useWebSocket.js';

export function Chat() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const {user} = useClerk()
    const [onlineUsers, setOnlineUsers] = useState(0)
    const onMessage = useCallback(
        (msg) => setMessages(prev => [...prev, msg]),
        []
    )
    const onOnlineCount = useCallback(
        (count) => setOnlineUsers(count),
        []
    )
    const {ws, sendMessage, userlist} = useWebSocket({
        username: user.username,
        onMessage, 
        onOnlineCount,
      });
    const {makeRequest} = useApi()
    const messagesEndRef = useRef(null);

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
        const lastMessage = messages[messages.length - 1];
        if(lastMessage && lastMessage.sender === user.username) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const timestamp = new Date().toLocaleTimeString();

        if(ws.current.readyState === WebSocket.OPEN) {
            sendMessage({"content": inputValue,
                "created_at": timestamp,
                "created_by": user.username
            })
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

    return (
        <div className="chat-main-layout">
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

            <div className="userlist-frame">
                <div className="online-users">
                    <span className="online-users-label">Online Users ({onlineUsers})</span>
                </div>
                
                <hr className="userlist-separator" />

                <div className="userlist">
                    {userlist.map((user, index) => (
                        <User key={index} username={user} />
                    ))}
                </div>
            </div>
        </div>
    );
}
