import styles from './Message.module.css'

export default function Message({ text, sender, timestamp }) {
    if (sender === '<System>') {
        return (
            <div className={`${styles.message} ${styles['system-message']}`}>
                <div className={styles['message-text']}>{text}</div>
            </div>
        );
    }
    return (
        <div className={styles.message}>
            <div className={styles['message-info']}>
                <span className={styles.sender}>{sender}</span>
                <span className={styles.timestamp}>{timestamp}</span>
            </div>
            <div className={styles['message-text']}>{text}</div>
        </div>
    );
};