import { useEffect, useRef, useState } from 'react';

import { parseTimestamp } from '../utils/dateUtils';

export function useWebSocket({ username, onMessage, onOnlineCount, dateHeadersCreated }) {
    const ws = useRef(null);
    const [userlist, setUserlist] = useState([])
    const onMessageRef = useRef(onMessage);
    const onOnlineCountRef = useRef(onOnlineCount);
    const lastDateRef = useRef(null);

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
                setUserlist(eventJSON.userlist)
                return;
            }
            if(eventJSON.content != `User ${username} entered the chat`) {
                const parsedDate = parseTimestamp(eventJSON.created_at);
                const currentDate = parsedDate ? new Date(
                    parsedDate.getFullYear(),
                    parsedDate.getMonth(),
                    parsedDate.getDate()
                ) : null;

                const shouldShowDateHeader = currentDate &&
                    (!lastDateRef.current || currentDate.getTime() !== lastDateRef.current.getTime());

                if(shouldShowDateHeader && dateHeadersCreated) {
                    lastDateRef.current = currentDate;
                    onMessageRef.current && onMessageRef.current({
                        text: null,
                        timestamp: parsedDate.toLocaleDateString('ru-RU'),
                        sender: '<DateHeader>',
                    })
                }
                const timestamp = (parsedDate) ? parsedDate.toLocaleTimeString() : eventJSON.created_at;
                onMessageRef.current && onMessageRef.current({
                    text: eventJSON.content,
                    timestamp: timestamp,
                    sender: eventJSON.created_by,
                });
            }
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