import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { setTimeout } from 'timers/promises';
import { WebSocket, WebSocketServer } from 'ws';

// Declare global WebSocket server type
declare global {
    var wss: WebSocketServer | undefined;
}

// Initialize WebSocket server if it hasn't been created
if (!(global as any).wss) {
    (global as any).wss = new WebSocketServer({ port: 8080 });
}

const wss = (global as any).wss!;

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json() as any;

    // Return WebSocket connection details
    return new Response(JSON.stringify({
        wsEndpoint: 'ws://localhost:8080',
        requestId: Date.now().toString() // Unique ID for this extraction request
    }));
};

// Handle WebSocket connections
wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (message: string) => {
        const { url, requestId } = JSON.parse(message);

        const executeCommand = () => {
            return new Promise((resolve, reject) => {
                const proc = exec(
                    `cd stageHand && npm run start -- ${url}`,
                    (error, stdout, stderr) => {
                        if (error) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                requestId,
                                data: error.message
                            }));
                            reject(error);
                            return;
                        }
                        if (stderr) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                requestId,
                                data: stderr
                            }));
                            reject(new Error(stderr));
                            return;
                        }
                        const extractedContent = stdout.split('###EXTRACT###')[1];
                        resolve(extractedContent);
                    }
                );

                // Stream stdout in real-time
                if (proc.stdout) {
                    let isArticleContent = false;

                    proc.stdout.on('data', (data: string) => {

                        const lines = data.toString().split('\n');
                        lines.forEach(line => {
                            if (line.trim()) {
                                // Check if line is a stagehand log
                                if (line.includes('::[stagehand:')) {
                                    ws.send(JSON.stringify({
                                        type: 'progress',
                                        requestId,
                                        data: line.trim()
                                    }));
                                }
                                // Check if line contains the extraction marker
                                else if (line.includes('###EXTRACT###')) {
                                    isArticleContent = true;
                                    console.log(line);
                                    // Send extraction complete message
                                    ws.send(JSON.stringify({
                                        type: 'extractionComplete',
                                        requestId
                                    }));
                                }
                                if(isArticleContent){
                                    ws.send(JSON.stringify({
                                        type: 'article',
                                        requestId,
                                        data: line.toString()
                                    }));
                                }
                            }
                        });

                    });

                    // Handle process completion
                    proc.on('close', () => {
                        setTimeout(1000);
                        ws.send(JSON.stringify({
                            type: 'complete',
                            requestId
                        }));
                        ws.close();
                        isArticleContent = false;
                    });
                }
            });
        };

        try {
            await executeCommand();
        } catch (error: any) {
            ws.send(JSON.stringify({
                type: 'error',
                requestId,
                data: error.message
            }));
        }
    });
});