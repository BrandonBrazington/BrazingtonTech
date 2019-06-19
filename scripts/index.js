$(document).ready(function () {
  var indoorTimeData = [],
    indoorTempData = [],
    indoorHumidityData = [],
    outdoorTimeData = [],
    outdoorTempData = [];
  var outdoorData = {
    labels: outdoorTimeData,
    datasets: [
      {
        fill: false,
        label: 'Outdoor Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(0, 204, 0, 1)",
        pointBoarderColor: "rgba(0, 204, 0, 1)",
        backgroundColor: "rgba(0, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(0, 204, 0, 1)",
        pointHoverBorderColor: "rgba(0, 204, 0, 1)",
        data: outdoorTempData
      }
    ]
  }

  var indoorData = {
    labels: indoorTimeData,
    datasets: [
      {
        fill: false,
        label: 'Indoor Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: indoorTempData
      },
      {
        fill: false,
        label: 'Indoor Humidity',
        yAxisID: 'Humidity',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: indoorHumidityData
      }
    ]
  }

  var outdoorOption = {
    title: {
      display: true,
      text: 'Outdoor Temperature Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(F)',
          display: true
        },
        position: 'left',
      }]
    }
  }

  var indoorOption = {
    title: {
      display: true,
      text: 'Indoor Temperature & Humidity Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(F)',
          display: true
        },
        position: 'left',
      }, {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity(%)',
          display: true
        },
        position: 'right'
      }]
    }
  }

  //Get the context of the canvas element for the outdoor chart
  var outdoorCtx = document.getElementById("outdoorChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var outdoorChart = new Chart(outdoorCtx, {
    type: 'line',
    data: outdoorData,
    options: outdoorOption
  });

  //Get the context of the canvas element for the indoor chart
  var indoorCtx = document.getElementById("indoorChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var indoorChart = new Chart(indoorCtx, {
    type: 'line',
    data: indoorData,
    options: indoorOption
  });




  // only keep no more than 50 points in the line chart
  const maxLen = 50;

  // SignalR Stuff below here

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://brazingtonapi.azurewebsites.net/api")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("newMessage", (message) => {
    console.log('Received message: ' + JSON.stringify(message));
    // Check if has deviceID and don't continue if it doesn't
    if (!message.deviceID) {
      console.log("Invalid message received (no deviceID)");
      return;
    }
    // Process Bedroom Temperature Data
    if (message.deviceID == "Bedroom") {
      $('#indoor-temperature-data').html(message.temperature + "&deg;");
      $('#indoor-humidity-data').html(message.humidity + "%");

      indoorTimeData.push(Date.now());
      indoorTempData.push(message.temperature);
      indoorHumidityData.push(message.humidity);

      // Only keep up to maxLen points in the line chart
      if (indoorTimeData.length > maxLen) {
        indoorTimeData.shift();
        indoorTempData.shift();
        indoorHumidityData.shift();
      }

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="indoorTempHumidity temperature">' + "Indoors: " + message.temperature + '&deg; with a humidity of ' + message.humidity + '% @ ' + Date.now() + '</div>');

      // Update indoor chart
      indoorChart.update();
    }
    // Process Balcony Temperature Data
    if (message.deviceID == "Balcony") {
      $('#outdoor-temperature-data').html(message.temperature + "&deg;");

      outdoorTimeData.push(Date.now());
      outdoorTempData.push(message.temperature);

      // Only keep up to maxLen points in the line chart
      if (outdoorTimeData.length > maxLen) {
        outdoorTimeData.shift();
        outdoorTempData.shift();
      }

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="outdoorTemperature temperature">' + "Outdoors: " + message.temperature + '&deg; @ ' + Date.now() + '</div>');

      // Update outdoor chart
      outdoorChart.update();
    }
  });

  connection.start().then(function () {
    console.log('Successfully connected to SignalR Service');
    $('#temperatureData').prepend('<div class="webSockets-message">SignalR Successfully Connected</div>');
  });

  // var onError = function (error) {
  //     console.log('WebSocket Error: ' + error);
  //     $('#temperatureData').prepend('<div class="webSockets-message">WebSocket Error: ' + error + '</div>');
  //   }
  //   ws.onerror = onError;
  //   var onClose = function (event) {
  //     console.log('WebSocket closed');
  //     $('#temperatureData').prepend('<div class="webSockets-message">WebSocket Closed; Attempting to reconnect</div>');
  //     ws = new WebSocket('wss://' + location.host);
  //     ws.onopen = onOpen;
  //     ws.onerror = onError;
  //     ws.onclose = onClose;
  //     ws.onmessage = onMessage;
  //   }
  //   ws.onclose = onClose;

});