/**
 * index.js - The backend server for the real-time voice chatbot.
 * This server uses Express to handle API requests and communicate with the Gemini and Google Cloud Text-to-Speech APIs.
 */
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure the Gemini APIs
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in the environment variables.');
    console.error('Please create a .env file in the same directory as index.js and add the line:');
    console.error('GEMINI_API_KEY=YOUR_API_KEY_HERE');
    process.exit(1);
}

// Define the models and URLs for the conversation.
const CONVERSATION_MODEL = 'gemini-2.5-flash-preview-05-20';
const CONVERSATION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CONVERSATION_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

// Route to handle text-to-speech requests
app.post('/generate-audio', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required.' });
    }

    try {
        // Step 1: Send the user's text to a conversational model to get a text response.
        const conversationPayload = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: "You are an AI assistant designed to provide information exclusively about Revolt motors. " + text }],
                },
            ],
        };

        const conversationResponse = await fetch(CONVERSATION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(conversationPayload),
        });

        if (!conversationResponse.ok) {
            const errorText = await conversationResponse.text();
            console.error('Gemini Conversation API Error:', conversationResponse.status, errorText);
            return res.status(conversationResponse.status).json({ error: `Gemini Conversation API Error: ${errorText}` });
        }

        const conversationData = await conversationResponse.json();
        const aiResponseText = conversationData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponseText) {
            console.error('Gemini Conversation API returned no text. This may be due to a content safety violation or a no-response block.');
            return res.status(500).json({ error: 'Failed to generate a text response due to content policy.' });
        }

        // Step 2: Send the text response to the Gemini TTS API.
        const ttsPayload = {
            contents: [
                {
                    parts: [{ text: aiResponseText }],
                },
            ],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Puck" }
                    }
                }
            },
        };

        const ttsResponse = await fetch(TTS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ttsPayload),
        });

        if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            console.error('Gemini TTS API Error:', ttsResponse.status, errorText);
            return res.status(ttsResponse.status).json({ error: `Gemini TTS API Error: ${errorText}` });
        }

        const ttsData = await ttsResponse.json();
        const audioData = ttsData?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (audioData) {
            res.json({ audioData: audioData, textResponse: aiResponseText });
        } else {
            console.error('No audio data in TTS API response.');
            res.status(500).json({ error: 'Failed to generate audio.' });
        }
    } catch (error) {
        console.error('General server error:', error);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
