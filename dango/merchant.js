const merchantItems = [
    "merchant_leaf",
    "merchant_water"
];

function getMerchantItems(){

    return merchantItems
    .map(id => items.find(item => item.id === id))
    .filter(item => item);
}
