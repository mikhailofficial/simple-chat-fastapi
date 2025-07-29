import Message from '../../components/Message/Message.jsx'
import styles from './ChatPage.module.css'

export default function ChatMessages({ messages, messagesEndRef, onDeleteMessage }) {
    return (
        <div className={styles['messages']}>
            {messages.map((msg, index) => (
                <Message 
                    key={msg.id || index}
                    text={msg.text}
                    sender={msg.sender}
                    timestamp={msg.timestamp} 
                    messageId={msg.id}
                    onDelete={onDeleteMessage}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}

