const weatherApiKey = 'ab029481c48023df511f0dd0f7824283';

let city;
let currentCity;
let coordinates;
let searchButton = document.querySelector("#search__button");
let searchInput = document.querySelector("#search__input");
let currentWeatherContainer = document.querySelector(".current-weather__content");
let hourlyWeatherContainer = document.querySelector(".hourly-weather__content");
let dailyWeatherContainer = document.querySelector(".daily-weather__content");
let units = 'imperial';
let searchMethod;

function getSearchMethod(searchOption) {
    if((searchOption.length === 5) && (Number.parseInt(searchOption)) + '' === searchOption){
        searchMethod = 'zip';
    } else {
        searchMethod = 'q';
    }
}

function searchWeather(searchOption) {
    let date = new Date();
    if ((localStorage.getItem("lastUpdateByHour")) && (localStorage.getItem(searchOption.toLowerCase()))) {
        if (localStorage.getItem("lastUpdateByHour") === date.getHours().toString() && 
            localStorage.getItem("lastUpdateByDay") === date.getDate().toString() &&
            localStorage.getItem("lastUpdateByMonth") === (date.getMonth()+1).toString()) {
            let weather = JSON.parse(localStorage.getItem(searchOption.toLowerCase()));
            getCurrentWeather(weather);
            getHourlyWeather(weather);
            getDailyWeather(weather);
        } else {
            getWeather(searchOption);
        }
    } else {
        getWeather(searchOption);
    }
}

function getWeather(searchOption) {
    getSearchMethod(searchOption);
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${searchOption}&APPID=${weatherApiKey}&units=${units}`).then(result => {
        return result.json();
    }).then(result => {
        currentCity = result.city.name;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${result.city.coord.lat}&lon=${result.city.coord.lon}&exclude=minutely&appid=${weatherApiKey}&units=${units}`).then(result => {
            return result.json();
        }).then(result => {
            date = new Date();
            result.city = currentCity;
            localStorage.setItem("lastUpdateByHour", date.getHours());
            localStorage.setItem("lastUpdateByDay", date.getDate());
            localStorage.setItem("lastUpdateByMonth", date.getMonth()+1);
            localStorage.setItem(searchOption.toLowerCase(), JSON.stringify(result));
            getCurrentWeather(result);
            getHourlyWeather(result);
            getDailyWeather(result);
        })
    })
}

function getCurrentWeather(resultFromServer) {
    switch (resultFromServer.current.weather[0].main) {
        case 'Clear':
            document.body.style.backgroundImage = 'url("assets/images/clear.jpg")';
            break;
        case 'Clouds':
            document.body.style.backgroundImage = 'url("assets/images/clouds.jpg")';
            break;
        case 'Rain': 
        case 'Drizzle':
        case 'Mist':
            document.body.style.backgroundImage = 'url("assets/images/rain.jpg")';
            break;
        case 'Fog':
            document.body.style.backgroundImage = 'url("assets/images/fog.jpg")';
            break;
        case 'Thunderstorm':
            document.body.style.backgroundImage = 'url("assets/images/storm.jpg")';
            break;
        case 'Snow':
            document.body.style.backgroundImage = 'url("assets/images/snow.jpg")';
            break;
        default:
            document.body.style.backgroundImage = 'url("assets/images/standard.jpg")';
            break;
    }

    while (currentWeatherContainer.firstChild) {
        currentWeatherContainer.firstChild.remove();
    }

    let city = resultFromServer.city;
    let weather = resultFromServer.current.weather[0].description;
    let weatherDescription = weather.charAt(0).toUpperCase() + weather.slice(1);
    let temp = Math.floor((resultFromServer.current.temp - 32) * 5 / 9) + '&#176' + 'C';
    let windSpeed = Math.floor(resultFromServer.current.wind_speed);
    let humidity = resultFromServer.current.humidity;
    let icon = resultFromServer.current.weather[0].icon;

    let currentDomElement;
    currentDomElement = document.createElement('div');
    currentDomElement.className = 'weather-current';
    currentDomElement.innerHTML = `
        <h2 class="weather-current__city">${city}</h2>
        <div class="weather-current__main">
            <div class="weather-current__temperature">${temp}</div>
            <div class="weather-current__description">${weatherDescription}</div>
            <div class="weather-current__image">
                <img class="weather-current__icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="">
            </div>
        </div>
        <div class="weather-current__additional">
            <div class="weather-current__wind">Wind ${windSpeed} m/s</div>
            <div class="weather-current__humidity">Humidity ${humidity} %</div>
        </div>
    `;

    currentWeatherContainer.append(currentDomElement);
    currentWeatherContainer.style.visibility = 'visible';
}

function getHourlyWeather(resultFromServer) {
    while (hourlyWeatherContainer.firstChild) {
        hourlyWeatherContainer.firstChild.remove();
    }

    let hourlyDomElements = [];
    for (let i = 0; i < 24; i++) {
        let dateUnix = resultFromServer.hourly[i].dt;
        let date = new Date(dateUnix * 1000);

        let dateDay = date.getDate();
        if (dateDay < 10) {
            dateDay = '0' + dateDay.toString();
        }

        let dateMonth = date.getMonth() + 1;
        if (dateMonth < 10) {
            dateMonth = '0' + dateMonth.toString();
        }

        let weather = resultFromServer.hourly[i].weather[0].description;
        let weatherDescription = weather.charAt(0).toUpperCase() + weather.slice(1);
        let temp = Math.floor((resultFromServer.hourly[i].temp - 32) * 5 / 9) + '&#176' + 'C';
        let windSpeed = Math.floor(resultFromServer.hourly[i].wind_speed);
        let humidity = resultFromServer.hourly[i].humidity;
        let icon = resultFromServer.hourly[i].weather[0].icon;

        hourlyDomElements[i] = document.createElement('div');
        hourlyDomElements[i].className = 'weather-hourly';
        hourlyDomElements[i].innerHTML = `
            <div class="weather-hourly__date">${dateDay}.${dateMonth}.${date.getFullYear()}</div>
            <div class="weather-hourly__time">${date.getHours()}:00</div>
            <div class="weather-hourly__main">
                <div class="weather-hourly__temperature">${temp}</div>
                <div class="weather-hourly__description">${weatherDescription}</div>
                <div class="weather-hourly__image">
                    <img class="weather-hourly__icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="">
                </div>
            </div>
            <div class="weather-hourly__additional">
                <div class="weather-hourly__wind">Wind ${windSpeed} m/s</div>
                <div class="weather-hourly__humidity">Humidity ${humidity} %</div>
            </div>
        `;
        
        hourlyWeatherContainer.append(hourlyDomElements[i]);
        hourlyWeatherContainer.style.visibility = "visible";
    }
}

function getDailyWeather(resultFromServer) {
    while (dailyWeatherContainer.firstChild) {
        dailyWeatherContainer.firstChild.remove();
    }

    let dailyDomElements = [];
    for (let daily of resultFromServer.daily) {
        let dateUnix = daily.dt;
        let date = new Date(dateUnix * 1000);

        let dateDay = date.getDate();
        if (dateDay < 10) {
            dateDay = '0' + dateDay.toString();
        }

        let dateMonth = date.getMonth() + 1;
        if (dateMonth < 10) {
            dateMonth = '0' + dateMonth.toString();
        }

        let weather = daily.weather[0].description;
        let weatherDescription = weather.charAt(0).toUpperCase() + weather.slice(1);
        let morningTemp = Math.floor((daily.temp.morn - 32) * 5 / 9) + '&#176' + 'C';
        let dayTemp = Math.floor((daily.temp.day - 32) * 5 / 9) + '&#176' + 'C';
        let EveningTemp = Math.floor((daily.temp.eve - 32) * 5 / 9) + '&#176' + 'C';
        let NightTemp = Math.floor((daily.temp.night - 32) * 5 / 9) + '&#176' + 'C';
        let windSpeed = Math.floor(daily.wind_speed);
        let humidity = daily.humidity;
        let icon = daily.weather[0].icon;

        dailyDomElements.push(document.createElement('div'));
        dailyDomElements[dailyDomElements.length - 1].className = 'weather-daily';
        dailyDomElements[dailyDomElements.length - 1].innerHTML = `
            <div class="weather-daily__date">${dateDay}.${dateMonth}.${date.getFullYear()}</div>
            <div class="weather-daily__main">
                <div class="weather-daily__description">${weatherDescription}</div>
                <div class="weather-daily__image">
                    <img class="weather-daily__icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="">
                </div>
            </div>
            <div class="weather-daily__common">
                <div class="weather-daily__daytime">
                    <div class="weather-daily__time">Morning: </div>
                    <div class="weather-hourly__temperature">${morningTemp}</div>
                </div>
                <div class="weather-daily__daytime">
                    <div class="weather-daily__time">Afternoon: </div>
                    <div class="weather-hourly__temperature">${dayTemp}</div>
                </div>
                <div class="weather-daily__daytime">
                    <div class="weather-daily__time">Evening: </div>
                    <div class="weather-hourly__temperature">${EveningTemp}</div>
                </div>
                <div class="weather-daily__daytime">
                    <div class="weather-daily__time">Night: </div>
                    <div class="weather-hourly__temperature">${NightTemp}</div>
                </div>
            </div>
            <div class="weather-daily__additional">
                <div class="weather-daily__wind">Wind ${windSpeed} m/s</div>
                <div class="weather-daily__humidity">Humidity ${humidity} %</div>
            </div>
        `;
        
        dailyWeatherContainer.append(dailyDomElements[dailyDomElements.length - 1]);
        dailyWeatherContainer.style.visibility = "visible";
    }
}

searchButton.addEventListener('click', () => {
    event.preventDefault();
    let searchOption = searchInput.value;
    if (searchOption){
        searchWeather(searchOption);
    }
})

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    var latitude = "latitude=" + position.coords.latitude;
    var longitude = "&longitude=" + position.coords.longitude;
    var query = latitude + longitude + "&localityLanguage=en";

    var bigdatacloud_api =
    "https://api.bigdatacloud.net/data/reverse-geocode-client?";

    bigdatacloud_api += query;

    fetch(bigdatacloud_api).then(result => {
        return result.json();
    }).then(result => {
        currentCity = result.city;
        getSearchMethod(currentCity);
        searchWeather(currentCity);
    })
}

getLocation();