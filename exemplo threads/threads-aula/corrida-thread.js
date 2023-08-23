const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')


function gerarNumerosAleattorios() {
    return Math.floor(Math.random() * 5) + 1;
}

function esperar(ms) {
    return new Promise(function (resolve){
        setTimeout(resolve, ms)
    })
}

async function realizarCorrida(idDathread){
    let posicaoAtual = 0;
    let totalPassos = 0;


    console.log(`Thread ${idDathread} - Iniciando`)


    while (posicaoAtual < 50) {
        const passos = gerarNumerosAleattorios()
        totalPassos += passos;
        posicaoAtual += passos;


        console.log(`Vez da thread ${idDathread}`)
        console.log(`Numero sorteado: ${passos}`)
        console.log(`Thread ${idDathread} Andou ${passos} casas`)
        console.log(`Posição atual da thread ${idDathread}: ${posicaoAtual}`)

        await esperar(1000)
    }

    console.log(`Thread ${idDathread} - Chegou a posição 50! Total de passos: ${totalPassos}`)

    return totalPassos
}

if (isMainThread) {
    const numThreads = 2
    let threadFinalizada = 0
    const resultados = []

    async function iniciarCorrida(){
        const promessas = []

        for (let i = 0; i < numThreads; i++) {
            const thread = new Worker(__filename, {
                workerData: i
            })

            thread.on('exit', () => {
                console.log(`Thread Secundaria ${i} finalizada`)
                threadFinalizada++

                if (threadFinalizada === numThreads) {
                    const indiceVencedor = resultados.findIndex((passos, indice) => indice === 0 || passos < resultados[indiceVencedor])
                    const idDathreadVencedora = indiceVencedor + 1
                    console.log(`Thread ${idDathreadVencedora} venceu com ${resultados[indiceVencedor]} passos`)
                }
            })

            promessas.push(new Promise((resolve, reject) => {
                thread.on('message', resolve)
                thread.on('error', reject)
            }))
        }

        resultados.push(...await Promise.all(promessas))
    }

    iniciarCorrida()
} else {
    async function threadSecundaria(){
        const idDathread = workerData !== undefined ? 'Thread ' + workerData : 'desconhecida'

        const totalPassos = await realizarCorrida(idDathread)

        parentPort.postMessage(totalPassos)
    }

    threadSecundaria()
}