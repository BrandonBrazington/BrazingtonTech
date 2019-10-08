let lastMessageTimes = {
  Balcony: -1,
  Bedroom: -1,
  LivingRoom: -1
};

let millisecondsRefreshTimeAfterWebsiteUpdate = -1;

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

  connection.on("newMessage", handleNewMessage);

  connection.on("updated", handleUpdatedMessage);

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

  setInterval(() => {
    let currentDateTime = new Date();
    updateLastRefreshedCounters();
    $("#date-card").html((currentDateTime.getMonth() + 1).toString() + "/" + currentDateTime.getDate().toString() + "/" + currentDateTime.getFullYear().toString());
    let currentHour = currentDateTime.getHours();
    let amOrPm = "AM";
    if (currentHour >= 12) {
      if (currentHour != 12) currentHour -= 12;
      amOrPm = "PM";
    } else if (currentHour == 0) {
      currentHour = 12;
    }
    $("#time-card").html(currentHour.toString() + ":" + currentDateTime.getMinutes().toString().padStart(2, '0') + ":" + currentDateTime.getSeconds().toString().padStart(2, '0') + " " + amOrPm)
  }, 1000);

  // Update UI with data for testing (comment out before uploading)
  // let currentDateTime = new Date();
  // let currentDateTimeString = (currentDateTime.getMonth()+1).toString() + "/" + currentDateTime.getDate().toString() + " " + currentDateTime.getHours().toString() + ":" + currentDateTime.getMinutes().toString().padStart(2, '0') + ":" + currentDateTime.getSeconds().toString().padStart(2, '0');
  // let testTemperatureString = "100.0" + "&deg;"
  // let testHumidityString = "50.0" + "%"
  // $('#outdoor-temperature-data').html(testTemperatureString);
  // $('#outdoor-temperature-time').text(currentDateTimeString);
  // $('#bedroom-temperature-data').html(testTemperatureString);
  // $('#bedroom-humidity-data').html(testHumidityString);
  // $('#bedroom-temperature-time').text(currentDateTimeString);
  // $('#bedroom-humidity-time').text(currentDateTimeString);
  // $('#living-room-temperature-data').html(testTemperatureString);
  // $('#living-room-humidity-data').html(testHumidityString);
  // $('#living-room-temperature-time').text(currentDateTimeString);
  // $('#living-room-humidity-time').text(currentDateTimeString);
});

function handleUpdatedMessage(secondsToWait) {
  console.log(`Website has been updated, reloading page in ${secondsToWait} seconds`);
  let currentDateTime = new Date();
  let currentMilliseconds = currentDateTime.getTime();
  millisecondsRefreshTimeAfterWebsiteUpdate = currentMilliseconds + (secondsToWait * 1000);
  updateLastRefreshedCounters();
  $("#updated-banner").removeAttr("hidden");
}

function handleNewMessage(message) {
  console.log('Received message: ' + JSON.stringify(message));
  // Check if has deviceID and don't continue if it doesn't
  if (!message.deviceID) {
    console.log("Invalid message received (no deviceID)");
    return;
  }

  // Process Balcony Temperature Data
  if (message.deviceID == "Balcony") {
    let currentDateTime = new Date();
    lastMessageTimes.Balcony = currentDateTime.getTime();
    let currentDateTimeString = (currentDateTime.getMonth() + 1).toString() + "/" + currentDateTime.getDate().toString() + " " + currentDateTime.getHours().toString() + ":" + currentDateTime.getMinutes().toString().padStart(2, '0') + ":" + currentDateTime.getSeconds().toString().padStart(2, '0');
    $('#outdoor-temperature-data').html(message.temperature + "&deg;");
    updateLastRefreshedCounters();
  }

  // Process Bedroom Temperature Data
  if (message.deviceID == "Bedroom") {
    let currentDateTime = new Date();
    lastMessageTimes.Bedroom = currentDateTime.getTime();
    let currentDateTimeString = (currentDateTime.getMonth() + 1).toString() + "/" + currentDateTime.getDate().toString() + " " + currentDateTime.getHours().toString() + ":" + currentDateTime.getMinutes().toString().padStart(2, '0') + ":" + currentDateTime.getSeconds().toString().padStart(2, '0');
    $('#bedroom-temperature-data').html(message.temperature + "&deg;");
    $('#bedroom-humidity-data').html(message.humidity + "%");
    updateLastRefreshedCounters();
  }

  // Process Living Room Temperature Data
  if (message.deviceID == "LivingRoom") {
    let messageDateTime = new Date(message.time * 1000);
    lastMessageTimes.LivingRoom = message.time * 1000;
    let messageDateTimeString = (messageDateTime.getMonth() + 1).toString() + "/" + messageDateTime.getDate().toString() + " " + messageDateTime.getHours().toString() + ":" + messageDateTime.getMinutes().toString().padStart(2, '0') + ":" + messageDateTime.getSeconds().toString().padStart(2, '0');
    $('#living-room-temperature-data').html(message.temperature + "&deg;");
    $('#living-room-humidity-data').html(message.humidity + "%");
    updateLastRefreshedCounters();
  }
}

function calculateSecondsBetweenMilliseconds(start, end) {
  return Math.round((end - start) / 1000);
}

function updateLastRefreshedCounters() {
  let currentDateTime = new Date();
  let currentMilliseconds = currentDateTime.getTime();
  if (lastMessageTimes.Bedroom != -1) {
    let bedroomSecondsSinceLastUpdate = calculateSecondsBetweenMilliseconds(lastMessageTimes.Bedroom, currentMilliseconds);
    $("#bedroom-humidity-time").text(bedroomSecondsSinceLastUpdate + " seconds ago")
    $("#bedroom-temperature-time").text(bedroomSecondsSinceLastUpdate + " seconds ago")
  }
  if (lastMessageTimes.LivingRoom != -1) {
    let livingRoomSecondsSinceLastUpdate = calculateSecondsBetweenMilliseconds(lastMessageTimes.LivingRoom, currentMilliseconds);
    $("#living-room-humidity-time").text(livingRoomSecondsSinceLastUpdate + " seconds ago")
    $("#living-room-temperature-time").text(livingRoomSecondsSinceLastUpdate + " seconds ago")
  }
  if (lastMessageTimes.Balcony != -1) {
    let balconySecondsSinceLastUpdate = calculateSecondsBetweenMilliseconds(lastMessageTimes.Balcony, currentMilliseconds);
    $("#outdoor-temperature-time").text(balconySecondsSinceLastUpdate + " seconds ago")
  }
  if (millisecondsRefreshTimeAfterWebsiteUpdate != -1) {
    secondsLeftBeforeRefresh = calculateSecondsBetweenMilliseconds(currentMilliseconds, millisecondsRefreshTimeAfterWebsiteUpdate);
    if (secondsLeftBeforeRefresh <= 0) {
      caches.delete("pwabuilder-offline");
      location.reload(true);
    }
    let minutes = parseInt(secondsLeftBeforeRefresh / 60, 10) % 60
    let seconds = (secondsLeftBeforeRefresh % 60).toString().padStart(2, "0")
    $("#page-refresh-timer").text(minutes + ":" + seconds)
  }
}