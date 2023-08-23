const socket = io();

const outputElement = document.getElementById('output');

function updateOutput(message) {
    outputElement.innerHTML += `<p>${message}</p>`;
}

socket.on('connect', () => {
    console.log('Conectado ao servidor');

    socket.emit('start_threads'); // Inicia as threads no backend
});

socket.on('progress', data => {
    const {
        threadId,
        count
    } = data;
    updateOutput(`Thread ${threadId} - Progresso: ${count}`);
});

socket.on('completed', data => {
    const {
        threadId
    } = data;
    updateOutput(`Thread ${threadId} - Concluída`);
});