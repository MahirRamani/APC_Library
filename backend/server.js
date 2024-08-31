// server.js
import express, { json, response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import fetch from "node-fetch"; // Install using `npm install node-fetch`
dotenv.config();

// Initialize express app
const app = express();
const port = 3000;


app.use(express.json());
// app.use(cookieParser());
app.use(cors());

app.post("/api/data/barcode", async (req, res) => {
  // console.log("hi");
  var response;
  try {
    const barcode = req.body.barcode;

    const response = await fetch(
      `${process.env.API_URL}?barcode=${encodeURIComponent(barcode)}`,
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(data);

    // Send back the data received from the external API
    res.json(data);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).send("Error retrieving data");
  }
}
);


// app.post("/api/data/operation", async (req, res) => {
//   // console.log("hi");

//   try {
//     console.log("entered");
//     console.log(req.body)
//     // console.log(req.body);
//     // console.log(req.body.barcode);

//     const response = await fetch(
//       `${process.env.API_URL}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(req.body),
//         mode: "no-cors",
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Error fetching data: ${response.statusText}`);
//     }

//     const data = await response.json();

//     // fetch(`${process.env.API_URL}`,
//     //   {
//     //     headers: {
//     //       "Content-Type": "application/json"
//     //     },
//     //     body: JSON.stringify(req.body),
//     //     mode: "no-cors",
//     //   }
//     // ).then
//     // console.log("-----------------------------------------------------------------------------");
//     // // console.log(response.parameter.barcode);
//     // // console.log(response);
//     res.json(data);
//     // console.log(process.env.API_URL);
//     // console.log("==========");
//     // return response;
//   } catch (error) {
//     res.status(500).send("Error retrieving data");
//   }
// });


app.post("/api/data/operation", async (req, res) => {
  try {
    console.log("Request body received:", req.body); // Debugging log

    const response = await fetch(`${process.env.API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      // Log the error details
      console.error(`Error fetching data from API: ${response.statusText}`);
      return res.status(response.status).send(`Error fetching data from API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);

    res.json(data); // Send the data back to the client

  } catch (error) {
    // Log error details to help debugging
    console.error("Internal Server Error:", error.message);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});





app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  // console.log("2");
  return res.send("Hello Mahir!");
});