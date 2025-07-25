import { useEffect, useRef, useState } from 'react';

export function useWebSocket({ username, onMessage, onOnlineCount }) {
    const ws = useRef(null);
    const [userlist, setUserlist] = useState([])
    const onMessageRef = useRef(onMessage);
    const onOnlineCountRef = useRef(onOnlineCount);

    useEffect(() => { onMessageRef.current = onMessage }, [onMessage]);
    useEffect(() => { onOnlineCountRef.current = onOnlineCount }, [onOnlineCount]);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/api/ws?username=' + username);

        ws.current.onopen = () => {
            const newMessage = {
                sender: '<System>',
                text: `User ${username} entered the chat`,
                timestamp: null,
            };
            ws.current.send(
                JSON.stringify({
                    content: newMessage.text,
                    created_at: newMessage.timestamp,
                    created_by: newMessage.sender,
                })
            );
        };

        ws.current.onmessage = (event) => {
            const eventJSON = JSON.parse(event.data);
            if (eventJSON.count) {
                onOnlineCountRef.current && onOnlineCountRef.current(eventJSON.count);
                return;
            }
            if(eventJSON.userlist) {
                //userlist.current = eventJSON.userlist;
                setUserlist(eventJSON.userlist)
                //console.log(userlist.current)
                return
            }
            onMessageRef.current && onMessageRef.current({
                text: eventJSON.content,
                timestamp: eventJSON.created_at,
                sender: eventJSON.created_by,
            });
        };

        const handleBeforeUnload = () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                const newMessage = {
                    sender: '<System>',
                    text: `User ${username} left the chat`,
                    timestamp: null,
                };
                ws.current.send(
                    JSON.stringify({
                        content: newMessage.text,
                        created_at: newMessage.timestamp,
                        created_by: newMessage.sender,
                    })
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (ws.current) {
                ws.current.onopen = null;
                ws.current.onmessage = null;
                ws.current.close();
            }
        };
    }, [username]);

    const sendMessage = (msgObj) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msgObj));
        }
    };

    return { ws, sendMessage, userlist };
} 