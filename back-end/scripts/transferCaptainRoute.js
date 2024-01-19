const express = require("express");
const path = require("path");
const router = express.Router();

const TransferCaptain = require("../model/transferCaptain");

// create transfer-captain request - page
router.post("/create-request/transfer-captain/:caseId", async (req, res) => {
  // console.log("req.body:: ", req.body)
  try {
    let lastId;
    await TransferCaptain.find()
      .sort({ _id: -1 })
      .limit(1)
      .then((requests) => {
        if (requests.length === 0) {
          lastId = 0;
        } else {
          lastId = requests[0].id;
        }
      })
      .catch((err) => console.log("errorr:: ", err));

    req.body["transferCaptainInfo"]["id"] = lastId + 1;
    // req.body['nonce'] = Math.floor(Math.random() * 10000);
    req.body["transferCaptainInfo"]["signature"] =
      req.body["signatureTransferCaptain"];

    // input req.body into schema
    const TransferCaptainInfo = new TransferCaptain(
      req.body["transferCaptainInfo"]
    );
    console.log("TransferCaptainInfo:: ", TransferCaptainInfo);

    // saving the data in mongodb database
    TransferCaptainInfo.save();

    // Send a 200 status if data is saved successfully
    res.status(200).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error("Error: ", err);
    // Send a 400 status if there is an error
    res.status(400).json({ error: "Error Occured" });
  }
});

// view all transfer-captain requests - page
router.get("/view-transfer-captain", async (req, res) => {
  // console.log("req.query:: ", req.query.userStateCode)
  const userStateCode = req.query.userStateCode;

  await TransferCaptain.find({ stateCode: userStateCode })
    .then((requests) => {
      res.send(requests);
    })
    .catch((err) => {
      // console.error("Error: ", err);
      res.status(400).json({ error: "Error Occured" });
    });
});

// view details of a transfer-captain request - page
router.get("/view-transfer-captain/:reqId", async (req, res) => {
  // console.log("req.params:: ", req.params)
  const userAddress = req.query.userAddress;
  let idParam = req.params["reqId"].replace(/[^0-9]/g, "");
  // console.log("matches:: ", idParam)

  try {
    // Find documents that match the specified conditions
    const matchingRequests = await TransferCaptain.find({ id: idParam });

    if (matchingRequests.length > 0) {
      const result = matchingRequests[0];

      // When receiving captain opens the request the receive will set to true 
      // check if the address of user === toCaptain address (receiving captain)
      if (userAddress == result.toCaptain) {
        //   console.log("result.toCaptain:: ", result.toCaptain)
        // Update the receiver field to true
        await TransferCaptain.updateOne(
          { id: idParam },
          { $set: { receiver: true } }
        );
      }

      // Convert Unix timestamp to JavaScript Date object
      const expiryDate = new Date(result.expiry * 1000);
    //   console.log("expiryDate: ", expiryDate)

      // Get the current date
      const currentDate = new Date();

      // Compare the expiry date with the current date
      if (currentDate > expiryDate) {
        // Update the document's isOpen status to closed
        await TransferCaptain.updateOne({ 'id': idParam }, { $set: { isOpen: false } });
      } 

      const request = await TransferCaptain.findOne({ id: idParam });
    //   console.log("request:: ",   request);

      // Send the updated or original document to the frontend
      res.status(200).json({ message: "Request retrieved successfully", document: request });
    } else {
      // No matching document found
      res.status(404).json({ error: "Document not found" });
    }
  } catch (err) {
    // Handle any errors that occurred during the process
    console.error("Error: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// sign transfer-captain request - push signer address in signers array (if not already exists)
router.post("/view-transfer-captain/:reqId", async (req, res) => {
  //   // console.log("req.params:: ", req.params)
  let idParam = req.params["reqId"].replace(/[^0-9]/g, "");
  //   // console.log("matches:: ", idParam)
  //   await TransferCaptain.updateOne(
  //     { id: `${idParam}` },
  //     {
  //       $addToSet: {
  //         signers: req.body.userAddress,
  //         signature: req.body.signature,
  //       },
  //     }
  //   )
  //     .then((requests) => res.status(200))
  //     .catch((err) => console.log("errorr:: ", err));

  // Check if userAddress already exists in the signers array
  const isAlreadySigned = await TransferCaptain.exists({
    id: `${idParam}`,
    signers: req.body.userAddress,
  });
  // console.log("isAlreadySigned:: ", isAlreadySigned)

  if (isAlreadySigned) {
    // If the userAddress already exists, send a message to the frontend
    res.status(200).json({ message: "Already signed" });
  } else {
    // If userAddress doesn't exist, add it to the signers array
    await TransferCaptain.updateOne(
      { id: `${idParam}` },
      {
        $addToSet: {
          signers: req.body.userAddress,
          signature: req.body.signature,
        },
      }
    )
      .then((requests) =>
        res.status(200).json({ message: "Signed successfully" })
      )
      .catch((err) => console.log("errorr:: ", err));
  }
});

module.exports = router;