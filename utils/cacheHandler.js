let totalProductCountCache = 0;

const {getTotalProductsCount} = require("../clover_api");

async function cacheTotalProducts(){
    try{
        console.log("Refreshing cache for total products");
        const count = await getTotalProductsCount();
        totalProductCountCache = count;
        console.log(`Cached total products count: ${count}`);
        return count;
    }catch(error){
        console.error("Error caching total products count: ", error);
        throw error;
    }
}

function getCachedTotalProducts(){
    console.log("Current cached total products count:", totalProductCountCache);

    return totalProductCountCache;
}

module.exports = {cacheTotalProducts, getCachedTotalProducts,};