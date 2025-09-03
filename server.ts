import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { McpMessage, McpRequest, McpResponse } from '@microsoft/mcp';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

// Handle MCP connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle incoming MCP messages
    socket.on('mcp.request', async (message: McpMessage<McpRequest>) => {
        try {
            console.log('Received request:', message);

            // Example response - you can customize this based on your needs
            const response: McpResponse = {
                type: 'mcp.response',
                id: message.id,
                payload: {
                    success: true,
                    result: {
                        message: 'Request processed successfully',
                        timestamp: new Date().toISOString()
                    }
                }
            };

            // Send response back to the client
            socket.emit('mcp.response', response);
        } catch (error) {
            console.error('Error processing request:', error);
            
            // Send error response
            const errorResponse: McpResponse = {
                type: 'mcp.response',
                id: message.id,
                payload: {
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Unknown error occurred'
                    }
                }
            };
            
            socket.emit('mcp.response', errorResponse);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`MCP Server is running on port ${PORT}`);
});