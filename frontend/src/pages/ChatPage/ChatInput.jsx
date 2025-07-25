import styles from './ChatPage.module.css'

export default function ChatInput({ inputValue, setInputValue, handleSendMessage, handleKeyDown }) {
    return (
        <div className={styles['input-panel']}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
}