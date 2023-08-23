const axios = require('axios')

async function getWikiPageExistence(wikiPageUrl){
    try {
        const response = await axios.get(wikiPageUrl)

        let pageStatus = "unknown"

        if (response.status === 200) {
            pageStatus = "Existe"
        } else if(response.status === 404){
            pageStatus = "Não existe"
        }

        return `${wikiPageUrl} - ${pageStatus}`
    } catch (error) {
        return `${wikiPageUrl} - error: ${error.message}`
    }
}

async function main(){
    console.log("Executando de forma sequencial:")

    function gerarWikiUrl(_, i){
        return `https://en.wikipedia.org/wiki/${i + 1}`
    }

    const wikiPageUrls = Array.from({
        length: 50
    }, gerarWikiUrl)
    

    const startTime = new Date().getTime()

    for (const url of wikiPageUrls) {
        console.log(await getWikiPageExistence(url))
    }

    const endTime = new Date().getTime()

    const elapsedTime = (endTime - startTime) / 1000

    console.log(`Tempo seuqencial: ${elapsedTime}s`)
}

main()