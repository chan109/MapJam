var axios = require("axios");
// var sampleAddress2 = "1600 Amphitheatre Parkway, Mountain View, CA";

function Util() {
    this.validateLocation = validateLocation;
    this.googleApiKey = "&key=AIzaSyA4wYEApzgWj5ubWBeZqU3OrBt7q9we_e8";
    this.googleServerUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    this.fetchGeoLocationByAddress = fetchLocation
}

//return true if location is valid else false
function validateLocation(location) {

    return new Promise(function (resolve, reject) {
        fetchLocation(location).then(function (res, err) {
            console.log(res);
            resolve(true)
        })
        .catch(function (err) {
            reject(false)
        })
    })
}

//convert addresss to geoLocation
function fetchLocation(location) {
    var temp = new Util();

    return new Promise(function (resolve, reject) {
        axios.get(temp.googleServerUrl + location + temp.googleApiKey).then(response => {
            resolve(response.data.results[0].geometry.location);
        })
        .catch(error => {
            reject({code: 404, msg: "fail to get geolocation"})
        });
    })
}

module.exports = Util;