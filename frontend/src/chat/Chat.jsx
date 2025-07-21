import 'react'
import {useState, useEffect} from 'react'
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
            } catch (err) {
                console.error("Error with recieving the messages:", err.message || "Didn't manage to load the messages.");
            }
        };

        loadMessages();
    }, []);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return
        
        const timestamp = new Date().toLocaleTimeString();

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

        setMessages([...messages, { text: inputValue, sender: user.username, timestamp: timestamp }]);
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
