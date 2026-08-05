window.merchantItems = items.map(item => item.id);

function getMerchantItems(){

    return window.merchantItems
        .map(id => items.find(item => item.id === id))
        .filter(item => item)
        .map(item => ({
            ...item,
            sellPrice: Math.floor(item.price * 0.3)
        }));

}
