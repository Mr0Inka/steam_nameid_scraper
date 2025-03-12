const needle = require("needle");
const fs = require("fs-extra");
const dotenv = require("dotenv").config()

const proxy = process.env.PROXY_URL
console.log(`Running on proxy ${proxy}`)

let nameIdList = {};
let counter = 0;
let itemsToFill = [];

const run = async () => {
    console.log("Loading full item list.")
    const itemList = await loadFullItemList();
    matchLists(itemList);
    itemsToFill = Object.entries(nameIdList).filter(([_, value]) => value === null).map(([key]) => key);

    console.log("Filling up missing nameids...")
    loop();
}

const loadFullItemList = async () => {
    return new Promise((resolve, reject) => {
        const itemListUrl = "https://bymykel.github.io/CSGO-API/api/en/all.json";
        needle.get(itemListUrl, (err, res) => {
            if (err) {
                reject(err)
            } else {
                const itemList = res.body;

                const marketHashNames = Object.values(itemList)
                    .map(item => item.market_hash_name)
                    .filter(name => name !== null && name !== undefined);

                console.log(`Loaded ${marketHashNames.length} items.`)
                resolve(marketHashNames)
            }
        })
    })
}

const matchLists = (marketHashNames) => {
    try {
        nameIdList = fs.readJSONSync("./files/nameids.json")
    } catch (exception) {
        console.log("Unable to read current list of nameids.")
    }

    let newIdList = {}

    marketHashNames.forEach(name => {
        const id = (name in nameIdList) ? (nameIdList[name]) : null;
        newIdList[name] = id;
    });

    console.log(`Added ${(marketHashNames.length - Object.keys(nameIdList).length)} new items.`);
    return nameIdList;
}

const loadPage = (market_hash_name) => {
    return new Promise((resolve, reject) => {
        const url = encodeURI(`https://steamcommunity.com/market/listings/730/${market_hash_name}`);
        needle.get(url, { proxy: proxy }, (err, res) => {
            if (err) return reject(err);
            try {
                const nameId = parseInt(res.body.split("Market_LoadOrderSpread( ")[1].split(" );")[0]);
                resolve(nameId);
            } catch (error) {
                reject(new Error("Failed to parse nameId"));
            }
        });
    });
};

const loop = async () => {
    const itemName = itemsToFill[counter]
    let nameid = false;

    try {
        const id = await loadPage(itemName);
        if (id) {
            nameIdList[itemName] = id;
        }
        nameid = id;
    } catch (exc) {
        delete nameIdList[itemName]
    }

    console.log(`[${counter}/${itemsToFill.length}] Loading ${itemName} ---> ${(nameid) ? nameid : "Unable to load nameid."}`)

    counter++;

    if (counter >= itemsToFill.length) {
        console.log("Finished!")
        process.exit()
    }
    fs.writeJsonSync('./files/nameids.json', nameIdList, err => { })
    setTimeout(loop, 500)
};

run();