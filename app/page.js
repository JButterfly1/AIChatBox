'use client'
import { Box, Button, Stack, TextField } from "@mui/material"
import Image from "next/image"
import { useState } from "react"
import background from "./api/chat/Components/background"

export default function Home() {
    const [messages, setMessages] = useState([{
        role: "assistant",
        content: "Hi there! Welcome to FromScratch! How can I assist you in creating a tasty and nutritious recipe today?",
    }])
    const [message, setMessage] = useState('')

    const sendMessage = async () => {
        if (!message.trim()) return
        setMessage('')

        setMessages(prevMessages => [
            ...prevMessages,
            { role: 'user', content: message },
            { role: 'assistant', content: '' },
        ])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: message }],
                }),
            })

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let result = ''

            const processText = async ({ done, value }) => {
                if (done) {
                    setMessages(prevMessages => {
                        const updatedMessages = [...prevMessages]
                        const lastMessageIndex = updatedMessages.length - 1
                        if (lastMessageIndex >= 0) {
                            updatedMessages[lastMessageIndex] = {
                                ...updatedMessages[lastMessageIndex],
                                content: result,
                            }
                        }
                        return updatedMessages
                    });
                    return
                }

                const text = decoder.decode(value, { stream: true })
                result += text;
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages]
                    const lastMessageIndex = updatedMessages.length - 1
                    if (lastMessageIndex >= 0) {
                        updatedMessages[lastMessageIndex] = {
                            ...updatedMessages[lastMessageIndex],
                            content: result,
                        }
                    }
                    return updatedMessages
                })

                return reader.read().then(processText)
            }

            reader.read().then(processText);
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                backgroundImage: "url('/Pantry bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <Stack
                direction="column"
                width="600px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}
                bgcolor="rgba(255,255,255,0.8)"
            >
                <Stack
                    direction="column"
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    <Image src="/image.png" width={100} height={100} alt="AI profile" />

                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
                        >
                            <Box
                                bgcolor={msg.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                                color="white"
                                borderRadius={16}
                                p={2}
                            >
                                {msg.content}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                </Stack>
            </Stack>
        </Box>
    )
}