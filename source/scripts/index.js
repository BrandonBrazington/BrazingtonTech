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
      let currentDateTime = new Date();
      let currentDateTimeString = currentDateTime.getMonth().toString() + "/" + currentDateTime.getDate().toString() + " " + currentDateTime.getHours().toString() + ":" + currentDateTime.getMinutes().toString().padStart(2, '0') + ":" + currentDateTime.getSeconds().toString().padStart(2, '0');
      $('#outdoor-temperature-data').html(message.temperature + "&deg;");
      $('#outdoor-temperature-time').text(currentDateTimeString);
    }

    // Process Bedroom Temperature Data
    if (message.deviceID == "Bedroom") {
      let currentDateTime = new Date();
      let currentDateTimeString = currentDateTime.getMonth().toString() + "/" + currentDateTime.getDate().toString() + " " + currentDateTime.getHours().toString() + ":" + currentDateTime.getMinutes().toString().padStart(2, '0') + ":" + currentDateTime.getSeconds().toString().padStart(2, '0');
      $('#bedroom-temperature-data').html(message.temperature + "&deg;");
      $('#bedroom-humidity-data').html(message.humidity + "%");
      $('#bedroom-temperature-time').text(currentDateTimeString);
      $('#bedroom-humidity-time').text(currentDateTimeString);
    }

    // Process Living Room Temperature Data
    if (message.deviceID == "LivingRoom") {
      let messageDateTime = new Date(message.time * 1000);
      let messageDateTimeString = messageDateTime.getMonth().toString() + "/" + messageDateTime.getDate().toString() + " " + messageDateTime.getHours().toString() + ":" + messageDateTime.getMinutes().toString().padStart(2, '0') + ":" + messageDateTime.getSeconds().toString().padStart(2, '0');
      $('#living-room-temperature-data').html(message.temperature + "&deg;");
      $('#living-room-humidity-data').html(message.humidity + "%");
      $('#living-room-temperature-time').text(messageDateTimeString);
      $('#living-room-humidity-time').text(messageDateTimeString);
    }
  });

  async function start() {
    try {
      await connection.start();
      console.log('Successfully connected to SignalR Service');
      $('#signalR-status-data').text('Connected');
      $('.signalR-status-div').addClass('connected');
    } catch (err) {
      console.log('SignalR Error: ' + err);
      $('#signalR-status-data').text('Not Connected');
      $('.signalR-status-div').removeClass('connected');
      setTimeout(() => start(), 5000);
    }
  };

  connection.onclose(async () => {
    $('#signalR-status-data').text('Not Connected');
    $('.signalR-status-div').removeClass('connected');
    await start();
  });

  start();
});