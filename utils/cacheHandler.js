let totalProductCountCache = 0;

const {getTotalProductsCount} = require("../clover_api");

async function cacheTotalProducts(){
    try{
        const count = await getTotalProductsCount();
        totalProductCountCache = count;
        console.log(`Cached total products count: ${count}`);
    }catch(error){
        console.error("Error caching total products count: ", error);
        throw error;
    }
}

function getCachedTotalProducts(){
    return totalProductCountCache;
}

module.exports = {cacheTotalProducts, getCachedTotalProducts,};