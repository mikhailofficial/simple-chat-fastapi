import 'react'
import {useState, useEffect, useRef, useCallback} from 'react'
import {useClerk} from '@clerk/clerk-react'

import {useApi} from '../../hooks/useApi.js'
import {useWebSocket} from '../../hooks/useWebSocket.js';

import styles from './ChatPage.module.css'

import ChatMessages from './ChatMessages.jsx'
import ChatInput from './ChatInput.jsx'
import ChatSidebar from './ChatSideBar.jsx'

import {parseTimestamp, shouldShowDateHeader} from '../../utils/dateUtils.js'

export function Chat() {
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef(null);
	const {user} = useClerk();
	const [onlineUsers, setOnlineUsers] = useState(0);
	const dateHeadersCreatedRef = useRef(new Set());
	const onMessage = useCallback(
		(msg) => {
			setMessages(prev => [...prev, msg]);

			if(msg.sender === '<DateHeader>' && msg.timestamp) {
				const headerDate = new Date(msg.timestamp);
				if (!isNaN(headerDate.getTime())) {
					dateHeadersCreatedRef.current.add(headerDate.toDateString());
				}
			}
		},
		[]
	);
	const onOnlineCount = useCallback(
		(count) => setOnlineUsers(count),
		[]
	);
	const {ws, sendMessage, userlist, } = useWebSocket({
		username: user.username,
		onMessage, 
		onOnlineCount,
		dateHeadersCreated: dateHeadersCreatedRef.current,
	  });
	const {makeRequest} = useApi()

	useEffect(() => {
		const loadMessages = async () => {
			try {
				const data = Object.values(await makeRequest("messages", { method: "GET" }))[0];
				const formattedMessages = [];
				let lastDate = null;

				data.forEach(element => {
					const messageDate = parseTimestamp(element.created_at);
					const currentDate = messageDate ? new Date(
						messageDate.getFullYear(),
						messageDate.getMonth(),
						messageDate.getDate(),
					) : null;

					if(shouldShowDateHeader(messageDate, lastDate)) {
						let timestamp;
						
						const today = new Date();
						const yesterday = new Date(today);
						yesterday.setDate(yesterday.getDate() - 1);
						
						if(today.toDateString() === messageDate.toDateString()) {
							timestamp = 'Today';
						}
						else if(yesterday.toDateString() === messageDate.toDateString()) {
							timestamp = 'Yesterday';
						}
						else {
							timestamp = messageDate.toLocaleDateString('en-US');
						}

						formattedMessages.push({
							text: null,
							timestamp: timestamp,
							sender: '<DateHeader>',
						});
						lastDate = currentDate;
						dateHeadersCreatedRef.current.add(messageDate.toDateString());
					}

					formattedMessages.push({
						id: element.id,
						text: element.content,
						timestamp: messageDate.toLocaleTimeString(),
						sender: element.created_by,
					});
				})
				setMessages(formattedMessages);

				setTimeout(() => {
					messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
				}, 100);                  
			} catch (err) {
				console.error("Error with receiving the messages:", err.message || "Didn't manage to load the messages.");
			}
		};
	
		loadMessages();
	}, []);
	
	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
			if (lastMessage && lastMessage.sender === user.username) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
			}, 100);
		}
	}, [messages,  user.username]);

	const handleSendMessage = async () => {
		if (!inputValue.trim()) {
			inputRef.current?.focus();
			return;
		}

		const timestamp = new Date();

		try {
			const response = await makeRequest("send-message", {
				method: "POST",
				body: JSON.stringify({
					"content": inputValue,
					"created_at": timestamp,
					"created_by": user.username,
				}),
			});

			if(ws.current.readyState === WebSocket.OPEN) {
				sendMessage({
					"id": response.id,
					"content": inputValue,
					"created_at": timestamp,
					"created_by": user.username
				});
			}
			else {
				console.log("Error: Server is close but you're trying to send request");
			}
		} catch (err) {
			console.error("Failed to send message:", err);
		}

		setInputValue('');
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSendMessage();
		}
	};

	const handleDeleteMessage = async (messageId) => {
		if(!messageId) {
			console.log("Cannot delete message without ID");
			return;
		}

		try {
			await makeRequest("delete-message", {
				method: "DELETE",
				body: JSON.stringify({
					"id": messageId
				}),
			});
			setMessages(prev => prev.filter(message => message.id !== messageId));
		} catch(err) {
			console.error("Failed to delete message:", err);
		}
	};

	const handleUpdateMessage = async (messageId, newContent) => {
		if(!messageId) {
			console.log("Cannot update message without ID");
			return;
		}

		try {
			await makeRequest("update-message", {
				method: "PATCH",
				body: JSON.stringify({
					"id": messageId,
					"content": newContent
				}),
			});
			setMessages(prev => prev.map(message => 
				message.id === messageId 
					? { ...message, text: newContent }
					: message
			));
		} catch(err) {
			console.error("Failed to update message:", err);
		}
	};

	return (
		<div className={styles['chat-main-layout']}>
			<div className={styles['chat-container']}>
				<ChatMessages 
					messages={messages}
					user={user.username}
					messagesEndRef={messagesEndRef}
					onDeleteMessage={handleDeleteMessage}
					onUpdateMessage={handleUpdateMessage}
				/>
				<ChatInput
					inputValue={inputValue}
					setInputValue={setInputValue}
					handleSendMessage={handleSendMessage}
					handleKeyDown={handleKeyDown}
					inputRef={inputRef}
				/>
			</div>
			<ChatSidebar onlineUsers={onlineUsers} userlist={userlist} />
		</div>
	);
}
