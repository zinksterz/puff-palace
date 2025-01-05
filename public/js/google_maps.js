
function initMap(){
    const storeLocation = { lat:42.7686, lng:-87.7877};
    const map = new google.maps.Map(document.getElementById("google-map"),{
        zoom:15,
        center:storeLocation,
    });
    new google.maps.Marker({
        position: storeLocation,
        map: map,
        title: "Our Store",
    });
}