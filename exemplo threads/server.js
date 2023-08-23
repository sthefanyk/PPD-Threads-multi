const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

function simulateThread(threadId, socket) {
    let count = 0;
    const interval = setInterval(() => {
        count++;
        socket.emit('progress', {
            threadId,
            count
        });
        console.log(`Thread ${threadId} - Progresso: ${count}`);
    }, 1000);

    setTimeout(() => {
        clearInterval(interval);
        socket.emit('completed', {
            threadId
        });
        console.log(`Thread ${threadId} - Concluída`);
    }, 10000);
}

if (isMainThread) {
    // Este é o thread principal (backend)
    server.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });

    io.on('connection', socket => {
        console.log('Novo cliente conectado.');

        socket.on('start_threads', () => {
            const numThreads = 2;

            for (let i = 1; i <= numThreads; i++) {
                const thread = new Worker(__filename);
                thread.on('exit', () => {
                    console.log(`Thread ${i} finalizada.`);
                });
                thread.postMessage({
                    action: 'executar',
                    threadId: i
                });
                simulateThread(i, socket);
            }
        });
    });
} else {
    // Este é o contexto da thread secundária
    const {
        threadId
    } = workerData;

    if (threadId !== undefined) {
        simulateThread(threadId, parentPort);
    }
}

app.use(express.static('public'));