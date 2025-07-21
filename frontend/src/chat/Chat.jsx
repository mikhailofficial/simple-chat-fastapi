import 'react'
import {useState} from 'react'
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

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return
        
        const timestamp = new Date().toLocaleTimeString();

        try {
            const data = await makeRequest("send-message", {
                method: "POST",
                body: JSON.stringify({
                    "content": inputValue,
                    "user_id": user.username
                }),
            }
            )
        } catch (err) {
            setError(err.message || "Failed to send message.")
        } 

        setMessages([...messages, { text: inputValue, sender: user.username, timestamp }]);
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
                    placeholder="Напишите сообщение..."
                />
                <button onClick={handleSendMessage}>Отправить</button>
            </div>
        </div>
    );
}
