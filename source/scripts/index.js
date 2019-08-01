$(document).ready(function () {
  // Redirect to HTTPS if not already
  if (document.location.protocol != "https:" & document.location.host == "www.brazington.tech") { 
    window.location.replace('https://www.brazington.tech/');
  }
  
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

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="outdoorTemperature">' + "Outdoors: " + message.temperature + '&deg; @ ' + new Date() + '</div>');
    }

    // Process Bedroom Temperature Data
    if (message.deviceID == "Bedroom") {
      $('#bedroom-temperature-data').html(message.temperature + "&deg;");
      $('#bedroom-humidity-data').html(message.humidity + "%");

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="bedroom-temp-humidity">' + "Bedroom: " + message.temperature + '&deg; with a humidity of ' + message.humidity + '% @ ' + new Date() + '</div>');
    }

    // Process Living Room Temperature Data
    if (message.deviceID == "LivingRoom") {
      $('#living-room-temperature-data').html(message.temperature + "&deg;");
      $('#living-room-humidity-data').html(message.humidity + "%");

      // Push raw data to DOM
      $('#temperatureData').prepend('<div class="living-room-temp-humidity">' + "Living Room: " + message.temperature + '&deg; with a humidity of ' + message.humidity + '% @ ' + new Date(message.time * 1000) + '</div>');
    }
  });

  async function start() {
    try {
      await connection.start();
      console.log('Successfully connected to SignalR Service');
      $('#temperatureData').prepend('<div class="signalR-message">SignalR Successfully Connected</div>');
      $('#signalR-status-data').text('Connected');
      $('.signalR-status-div').addClass('connected');
    } catch (err) {
      console.log('SignalR Error: ' + err);
      $('#temperatureData').prepend('<div class="signalR-message">SignalR Error: See developer console for more details');
      $('#signalR-status-data').text('Not Connected');
      $('.signalR-status-div').removeClass('connected');
      setTimeout(() => start(), 5000);
    }
  };

  connection.onclose(async () => {
    $('#temperatureData').prepend('<div class="signalR-message">SignalR Disconnected: Attempting to reconnect</div>');
    $('#signalR-status-data').text('Not Connected');
    $('.signalR-status-div').removeClass('connected');
    await start();
  });

  start();
});