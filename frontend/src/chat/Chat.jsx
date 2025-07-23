import 'react'
import {useState, useEffect, useRef} from 'react'
import {useApi} from '../utils/api.js'
import {useClerk} from '@clerk/clerk-react'

const Message = ({ text, sender, timestamp }) => (
    <div className="message">
        <div className="message-info">
            <span className="sender">{sender}</span>
            <span className="timestamp">{timestamp}</span>
        </div>
        <div className="message-text">{text}</div>
    </div>
);

export function Chat() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const {user} = useClerk()
    const ws = useRef(null)
    const {makeRequest} = useApi()

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8000/api/ws");

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
        };

        loadMessages();

        ws.current.onmessage = (event) => {
            const eventJSON = JSON.parse(event.data)
            //console.log(eventJSON)
            const newMessage = {
                text: eventJSON.content,
                timestamp: eventJSON.created_at,
                sender: eventJSON.created_by,
            };
            console.log(newMessage.text)
            //setMessages([...messages, { text: newMessage.text, sender: newMessage.sender, timestamp: newMessage.timestamp }]);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        ws.current.onclose = (event) => {
            console.log("Server is closed")
        }

        return () => {
            if (ws.current) {
                ws.current.onmessage = null;
                ws.current.onclose = null;
                ws.current.close();
            }
        };
    }, []);

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

        // while(true) {
        //     if(ws.readyState === WebSocket.OPEN) {
        //         ws.send(JSON.stringify({
        //             "content": inputValue,
        //             "created_at": timestamp,
        //             "created_by": user.username,
        //         }))
        //         break;
        //     }
        //     else {
        //         setTimeout(() => {
        //             console.log("Server is closed")
        //         }, 1000); 
        //     }
        // }

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

        //setMessages([...messages, { text: inputValue, sender: user.username, timestamp: timestamp }]);
        //setMessages(prevMessages => [...prevMessages, { text: inputValue, sender: user.username, timestamp: timestamp }]);
        setInputValue('')
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <Message key={index} text={msg.text} sender={msg.sender} timestamp={msg.timestamp} />
                ))}
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
    );
}
