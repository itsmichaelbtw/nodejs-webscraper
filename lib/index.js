const cheerio = require("cheerio")
const getUrls = require("get-urls")
const fetch = require("node-fetch").default
const fs = require("fs")

const scrapeTags = (text) => {
    const urls = Array.from( getUrls(text) )

    try {
        const requests = urls.map(async url => {
            const res = await fetch(url)
            const html = await res.text()
            const $ = cheerio.load(html)

            const getMetaTags = (name) => $(`meta[name=${name}]`).attr() || $(`meta[property="og:${name}"]`).attr("content") || $(`meta[property="twitter:${name}"]`).attr("content")

            return {
                url: url,
                title: $("title").first().text(),
                favicon: $("link[rel='shortcut icon']").attr("href"),
                description: getMetaTags("description"),
                image: getMetaTags("image"),
                author: getMetaTags("author"),
                script: $("script").toArray().map(l => l.attribs["src"])
            }
        })

        return Promise.all(requests)
    } catch (error) {
        console.log(error)
    }
}

(async function(){
    const args = process.argv.toString()
    const tags = await scrapeTags(args)
    console.log(tags)
})()






