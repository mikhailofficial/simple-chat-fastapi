import 'react'
import {useState, useEffect, useRef, useCallback} from 'react'
import {useClerk} from '@clerk/clerk-react'

import {useApi} from '../../hooks/useApi.js'
import {useWebSocket} from '../../hooks/useWebSocket.js';

import styles from './ChatPage.module.css'

import ChatMessages from './ChatMessages.jsx'
import ChatInput from './ChatInput.jsx'
import ChatSidebar from './ChatSideBar.jsx'

export function Chat() {
    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null);
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

                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
                }, 100);                  
            } catch (err) {
                console.error("Error with recieving the messages:", err.message || "Didn't manage to load the messages.");
            }
        };
    
        loadMessages();
    }, []);
    
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.sender === user.username) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
            }, 100);
        }
    }, [messages,  user.username]);

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
        <div className={styles['chat-main-layout']}>
            <div className={styles['chat-container']}>
                <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
                <ChatInput inputValue={inputValue} setInputValue={setInputValue} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} />
            </div>
            <ChatSidebar onlineUsers={onlineUsers} userlist={userlist} />
        </div>
    );
}
