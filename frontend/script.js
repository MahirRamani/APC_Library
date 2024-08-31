const videoElement = document.getElementById("scanner");
const barcodeResultElement = document.getElementById("barcode-result");
// barcodeResultElement.textContent = "Helllo !!";
const libraryLogo = document.getElementById("library-logo"); // Get the logo element
let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader();
let videoStream; // A variable to keep track of the video stream

function initializer() {
  barcodeResultElement.textContent = "Waiting for barcode...";
  const startScanButton = document.getElementById("startScanButton");

  // Change button text to "Scanning..." and disable the button
  startScanButton.textContent = "Scanning...";
  startScanButton.disabled = true;

  codeReader
    .listVideoInputDevices()
    .then((videoInputDevices) => {
      if (videoInputDevices.length == 1) {
        selectedDeviceId = videoInputDevices[0].deviceId;
        startScanning(selectedDeviceId);
      }
      else if (videoInputDevices.length > 1) {
        selectedDeviceId = videoInputDevices[1].deviceId;
        startScanning(selectedDeviceId);
      } else {
        console.error("No Video Input devices found !!");
        barcodeResultElement.textContent = "No Video Input devices found !!";
      }
    })
    .catch((err) => {
      console.error(err);
      barcodeResultElement.textContent = "Error accessing Video Input devices.";
    });
}

function startScanning(deviceId) {
  codeReader
    .decodeFromVideoDevice(deviceId, "scanner", (result, err) => {
      if (result) {
        // const startScanButton = document.getElementById("startScanButton");

        // Change button text to "Scanning..." and disable the button
        // startScanButton.textContent = "Scanning  ...";
        console.log(result.text);
        startScanButton.style.display = "none";
        barcodeResultElement.textContent = "Barcode Detected : " + result.text; // Display a success message
        sendBarcodeData(result.text); // Call your function with the scanned barcode
        stopScanning(); // Stop the scanning and hide the video element
      } else if (err && !(err instanceof ZXing.NotFoundException)) {
        console.error(err);
      }
    })
    .then((stream) => {
      videoStream = stream; // Keep track of the stream to stop it later
    });
}

function stopScanning() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop()); // Stop each track of the stream
  }
  videoElement.style.display = "none"; // Hide the video element
}

libraryLogo.addEventListener("click", () => {
  videoElement.style.display = "block"; // Show the video element again
  startScanning(selectedDeviceId); // Restart the scanning process
  window.location.reload(); // Refresh the page
});

function sendBarcodeData(barcode) {
  console.log('000000000000000000000000000000000000000');
  console.log(barcode);

  fetch(`http://localhost:3000/api/data/barcode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      barcode: barcode,
    })
  })
    .then((response) => response.json())
    .then((data) => {
      stopScanning();
      console.log("data from appscript");
      console.log(data);
      // console.log(data.students);
      // const book = data.books.find((t) => t.ID == barcode);
      const resultCard = document.getElementById("result-card");
      resultCard.innerHTML = "";
      // console.log(book);
      // console.log(book.Name);

      if (data.MSG != "Invalid Barcode !!" || data.findBookStatus == "Valid Barcode") {
        // transaction = data.transactions.find((t) => t.ID == barcode);
        // console.log(transaction);

        if (data.findBookTxnStatus == null || (data.findBookTxnStatus == "Transaction Found" && ((data.issueDate == null && data.dueDate == null)||(data.issueDate == "" && data.dueDate == "")))) {
          const currentDate = new Date();
          const dueDate = currentDate + 15;
          // console.log(dueDate);
          // console.log(currentDate);
          // console.log(currentDate > dueDate);


          // If the current date is after the due date, allow reissue
          console.log("kok issue karave 6e");

          resultCard.innerHTML = `
          <h3>Barcode : ${barcode}</h3>
          <p><b>Book Name</b> : ${data.bookName}</p>
          <button id="issueBookButton" onclick="issueBook('${barcode}', '${data.bookName}')">Issue Book</button>
          <div id="loadingSymbol" style="display: none;">Loading...</div>
          `;

        } else {
          
          const issueDate = new Date(data.issueDate);
          const dueDate = new Date(data.dueDate);
          console.log("kok renew/return karave 6e");
          resultCard.innerHTML = `
            <p><b>Book Name</b> : ${data.bookName}</p>
            <p><b>Issued By</b> : ${
            // bakiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
            data.stdName ? data.stdName : "Unknown"
            } (Roll No - ${data.rollNo ? data.rollNo : "N/A"})</p>
            <p><b>Issue Date</b> : ${issueDate.toLocaleDateString()}</p>
            <p><b>Due Date</b> : ${dueDate.toLocaleDateString()}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;" }>
            <button id="returnBookButton" onclick="returnBook('${barcode}')">Return Book</button>
            <button id="renewBookButton" onclick="renewBook('${barcode}')">Renew Book</button>
            </div>
          `;

        }
        resultCard.style.display = "block";
      } else {
        barcodeResultElement.textContent = `No Book found for this barcode: ${barcode}.`;
      }
    })
    .catch((error) => {
      console.error("Error fetching the API data:", error);
      barcodeResultElement.textContent = "Error fetching data.";
    });
}

function issueBook(barcode, bookName) {

  console.log("issuebook");


  const issueBookButton = document.getElementById("issueBookButton");
  const loader = document.getElementById("loader");
  const loaderContainer = document.getElementById("loader-container");

  // Disable the button and show the loader
  issueBookButton.disabled = true;
  loader.style.display = "block"; // Show the loader
  loaderContainer.style.display = "flex"; // Center the loader

  const rollNumber = prompt("Please Enter the Roll No :");

  // Check if rollNumber is not empty and is an integer
  if (!rollNumber || !/^\d+$/.test(rollNumber)) {
    alert("A valid integer Roll No is required to issue a book.");
    issueBookButton.disabled = false;
    loader.style.display = "none";
    return;
  }

  const duration = 15;
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + duration);

  const issueData = {
    action: "issueBook",
    barcode: barcode,
    bookName: bookName,
    issueBy: rollNumber,
    issueDate: currentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
    dueDate: dueDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
  };

  fetch(`http://localhost:3000/api/data/operation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(issueData)
    // mode: "no-cors",
  })
    .then((data) => {
      console.log("Book issued successfully:", data);
      alert("Book issued successfully.");
      window.location.reload(true); // true is optional and for forcing hard reload in some browsers

      // Hide the loader and enable the button
      // loader.style.display = "none";
      // issueBookButton.disabled = false;

      // Navigate to the div with the class "container"
      // const containerDiv = document.querySelector(".container");
      // // containerDiv.scrollIntoView({ behavior: 'smooth' });
      // if (containerDiv) {
      //   containerDiv.style.display = 'block'; // Show the div
      //   containerDiv.scrollIntoView({ behavior: "smooth" });
      // }
    })
    .catch((error) => {
      console.error("Error issuing book:", error);
      alert("Error issuing the book.");

      // Hide the loader and enable the button
      loader.style.display = "none";
      issueBookButton.disabled = false;
    });
}

function renewBook(barcode) {
  const renewBookButton = document.getElementById("renewBookButton");
  const returnBookButton = document.getElementById("returnBookButton");
  const loader = document.getElementById("loader");

  // Disable the button and show the loader
  renewBookButton.disabled = true;
  returnBookButton.disabled = true;
  loader.style.display = "block";

  console.log("renewBook");
  console.log(barcode);

  const newDueDate = new Date();
  newDueDate.setDate(newDueDate.getDate() + 20);

  console.log(newDueDate);


  const renewData = {
    action: "renewBook",
    barcode: barcode,
    newDueDate: newDueDate.toISOString().split("T")[0],
  };

  fetch(`http://localhost:3000/api/data/operation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(renewData),
    // mode: "no-cors",
  })
    // .then((response) => response.json())
    .then((data) => {
      alert("Book renewed successfully.");
      window.location.reload();
    })
    .catch((error) => console.error("Error renewing book:", error));
}

function returnBook(barcode) {
  const returnBookButton = document.getElementById("returnBookButton");
  const renewBookButton = document.getElementById("renewBookButton");
  const loader = document.getElementById("loader");

  // Disable the button and show the loader
  returnBookButton.disabled = true;
  renewBookButton.disabled = true;
  loader.style.display = "block";

  const returnDate = new Date().toISOString().split("T")[0];

  const returnData = {
    action: "returnBook",
    barcode: barcode,
    returnDate: returnDate,
  };

  fetch(`http://localhost:3000/api/data/operation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(returnData),
    // mode: "no-cors",
  })
    // .then((response) => response.json())
    .then(() => {
      alert("Book returned successfully.");
      window.location.reload();
    })
    .catch((error) => console.error("Error returning book:", error));
}
