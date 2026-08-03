window.merchantItems = [
    "leaf",
    "water"
];

function getMerchantItems(){

    return window.merchantItems
    .map(id => items.find(item => item.id === id))
    .filter(item => item);

}
