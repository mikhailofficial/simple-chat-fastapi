import { useState } from 'react'

import styles from './Message.module.css'

export default function Message({ text, sender, timestamp, onDelete, messageId }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleDelete = (e) => {
        e.stopPropagation();
        if(onDelete && messageId) {
            const confirmed = window.confirm('Are you sure you want to delete this message?');
            if(confirmed) {
                onDelete(messageId);
            }
        }
    };

    if (sender === '<System>') {
        return (
            <div className={`${styles['system-message']}`}>
                <div className={styles['message-text']}>{text}</div>
            </div>
        );
    }
    if (sender === '<DateHeader>') {
        return (
            <div className={`${styles['date-header']}`}>
                <div className={styles['date-text']}>{timestamp}</div>
            </div>
        );
    }

    return (
        <div 
            className={styles.message}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}    
            style={{ position: 'relative' }}
        >
            {isHovered && (
                <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    title="Delete message"
                    aria-label='Delete message'
                >
                    ×
                </button>
            )}
            <div className={styles['message-info']}>
                <span className={styles.sender}>{sender}</span>
                <span className={styles.timestamp}>{timestamp}</span>
            </div>
            <div className={styles['message-text']}>{text}</div>
        </div>
    );
};