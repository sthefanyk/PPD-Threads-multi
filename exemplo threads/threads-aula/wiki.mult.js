const axios = require('axios');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

async function getWikiPageExistence(wikiPageUrl) {
    try {
        const response = await axios.get(wikiPageUrl);

        let pageStatus = "unknown";

        if (response.status === 200) {
            pageStatus = "Existe";
        } else if (response.status === 404) {
            pageStatus = "Não existe";
        }

        return `${wikiPageUrl} - ${pageStatus}`;
    } catch (error) {
        return `${wikiPageUrl} - error: ${error.message}`;
    }
}

function runWorker() {
    const urls = workerData.urls;
    const results = [];

    urls.forEach(async (url) => {
        const result = await getWikiPageExistence(url);
        results.push(result);
    });

    parentPort.postMessage(results);
}

if (isMainThread) {
    console.log("Executando com Web Workers:");

    const NUM_WORKERS = 4;
    const wikiPageUrls = Array.from({ length: 50 }, (_, i) => `https://en.wikipedia.org/wiki/${i + 1}`);

    const chunkSize = Math.ceil(wikiPageUrls.length / NUM_WORKERS);
    const chunks = [];

    for (let i = 0; i < wikiPageUrls.length; i += chunkSize) {
        chunks.push(wikiPageUrls.slice(i, i + chunkSize));
    }

    const workerPromises = [];

    for (const chunk of chunks) {
        const worker = new Worker(__filename, { workerData: { urls: chunk } });
        const promise = new Promise((resolve) => {
            worker.on('message', (message) => {
                resolve(message);
            });
        });
        workerPromises.push(promise);
    }

    Promise.all(workerPromises)
        .then((resultsArray) => {
            const results = [].concat(...resultsArray);
            results.forEach((result) => {
                console.log(result);
            });
        })
        .catch((error) => {
            console.error(error);
        });
} else {
    runWorker();
}
