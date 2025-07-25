import Message from '../../components/Message/Message.jsx'
import styles from './ChatPage.module.css'

export default function ChatMessages({ messages, messagesEndRef }) {
    return (
        <div className={styles['messages']}>
            {messages.map((msg, index) => (
                <Message key={index} text={msg.text} sender={msg.sender} timestamp={msg.timestamp} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}

