export default function Message({ text, sender, timestamp }) {
    if (sender === '<System>') {
        return (
            <div className="message system-message">
                <div className="message-text">{text}</div>
            </div>
        );
    }
    return (
        <div className="message">
            <div className="message-info">
                <span className="sender">{sender}</span>
                <span className="timestamp">{timestamp}</span>
            </div>
            <div className="message-text">{text}</div>
        </div>
    );
};