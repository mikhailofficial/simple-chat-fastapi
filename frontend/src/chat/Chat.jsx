import 'react'
import {useState} from 'react'
import {useApi} from '../utils/api.js'

const Message = ({ text }) => (
    <div className="message">
        {text}
    </div>
);

export function Chat() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const {makeRequest} = useApi()

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return
        
        try {
            const data = await makeRequest("send-message", {
                method: "POST",
                body: JSON.stringify({
                    "content": inputValue
                }),
            }
            )
        } catch (err) {
            setError(err.message || "Failed to send message.")
        } 

        setMessages([...messages, inputValue])
        setInputValue('')
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <Message key={index} text={msg} />
                ))}
            </div>
            
            <div className="input-panel">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Напишите сообщение..."
                />
                <button onClick={handleSendMessage}>Отправить</button>
            </div>
        </div>
    );
}
