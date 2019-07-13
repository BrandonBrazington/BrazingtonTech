$(document).ready(function () {
  var bedroomTimeData = [],
    bedroomTempData = [],
    bedroomHumidityData = [],
    livingRoomTimeData = [],
    livingRoomTempData = [],
    livingRoomHumidityData = [],
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

  var bedroomData = {
    labels: bedroomTimeData,
    datasets: [
      {
        fill: false,
        label: 'Bedroom Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: bedroomTempData
      },
      {
        fill: false,
        label: 'Bedroom Humidity',
        yAxisID: 'Humidity',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: bedroomHumidityData
      }
    ]
  }

  var livingRoomData = {
    labels: livingRoomTimeData,
    datasets: [
      {
        fill: false,
        label: 'Living Room Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: livingRoomTempData
      },
      {
        fill: false,
        label: 'Living Room Humidity',
        yAxisID: 'Humidity',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: livingRoomHumidityData
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

  var bedroomOption = {
    title: {
      display: true,
      text: 'Bedroom Temperature & Humidity Real-time Data',
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

  var livingRoomOption = {
    title: {
      display: true,
      text: 'Living Room Temperature & Humidity Real-time Data',
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
  var outdoorCtx = document.getElementById("outdoor-chart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var outdoorChart = new Chart(outdoorCtx, {
    type: 'line',
    data: outdoorData,
    options: outdoorOption
  });

  //Get the context of the canvas element for the bedroom chart
  var bedroomCtx = document.getElementById("bedroom-chart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var bedroomChart = new Chart(bedroomCtx, {
    type: 'line',
    data: bedroomData,
    options: bedroomOption
  });

//Get the context of the canvas element for the living room chart
var livingRoomCtx = document.getElementById("living-room-chart").getContext("2d");
var optionsNoAnimation = { animation: false }
var livingRoomChart = new Chart(livingRoomCtx, {
  type: 'line',
  data: livingRoomData,
  options: livingRoomOption
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
      $('#temperatureData').prepend('<div class="outdoorTemperature">' + "Outdoors: " + message.temperature + '&deg; @ ' + Date.now() + '</div>');

      // Update outdoor chart
      outdoorChart.update();
    }
    // Process Bedroom Temperature Data
    if (message.deviceID == "Bedroom") {
      $('#bedroom-temperature-data').html(message.temperature + "&deg;");
      $('#bedroom-humidity-data').html(message.humidity + "%");

      bedroomTimeData.push(Date.now());
      bedroomTempData.push(message.temperature);
      bedroomHumidityData.push(message.humidity);

      // Only keep up to maxLen points in the line chart
      if (bedroomTimeData.length > maxLen) {
        bedroomTimeData.shift();
        bedroomTempData.shift();
        bedroomHumidityData.shift();
      }

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="bedroom-temp-humidity">' + "Bedroom: " + message.temperature + '&deg; with a humidity of ' + message.humidity + '% @ ' + Date.now() + '</div>');

      // Update bedroom chart
      bedroomChart.update();
    }
    // Process Living Room Temperature Data
    if (message.deviceID == "LivingRoom") {
      $('#living-room-temperature-data').html(message.temperature + "&deg;");
      $('#living-room-humidity-data').html(message.humidity + "%");

      livingRoomTimeData.push(Date.now());
      livingRoomTempData.push(message.temperature);
      livingRoomHumidityData.push(message.humidity);

      // Only keep up to maxLen points in the line chart
      if (livingRoomTimeData.length > maxLen) {
        livingRoomTimeData.shift();
        livingRoomTempData.shift();
        livingRoomHumidityData.shift();
      }

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="living-room-temp-humidity">' + "Living Room: " + message.temperature + '&deg; with a humidity of ' + message.humidity + '% @ ' + Date.now() + '</div>');

      // Update living room chart
      livingRoomChart.update();
    }
  });

  async function start() {
    try {
      await connection.start();
      console.log('Successfully connected to SignalR Service');
      $('#temperatureData').prepend('<div class="signalR-message">SignalR Successfully Connected</div>');
    } catch (err) {
      console.log('SignalR Error: ' + err);
      $('#temperatureData').prepend('<div class="signalR-message">SignalR Error: See developer console for more details');
        setTimeout(() => start(), 5000);
    }
};

connection.onclose(async () => {
  $('#temperatureData').prepend('<div class="signalR-message">SignalR Disconnected: Attempting to reconnect</div>');
    await start();
});

  start();

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