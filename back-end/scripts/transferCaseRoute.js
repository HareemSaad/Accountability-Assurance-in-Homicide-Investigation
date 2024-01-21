const express = require("express");
const path = require("path");
const router = express.Router();

const TransferCase = require("../model/transferCase");

// create transfer-case request - page
router.post("/create-request/transfer-case/:caseId", async (req, res) => {
  // console.log("req.body:: ", req.body)
  try {
    let lastId;
    await TransferCase.find()
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

    req.body["id"] = lastId + 1;

    // input req.body into schema
    const TransferCaseInfo = new TransferCase(req.body);
    console.log("TransferCaseInfo:: ", TransferCaseInfo);

    // saving the data in mongodb database
    TransferCaseInfo.save();

    // Send a 200 status if data is saved successfully
    res.status(200).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error("Error: ", err);
    // Send a 400 status if there is an error
    res.status(400).json({ error: "Error Occured" });
  }
});

// view all transfer-case requests - page
router.get("/view-transfer-case", async (req, res) => {
  // console.log("req.query:: ", req.query.userStateCode)
  const userStateCode = req.query.userStateCode;

  await TransferCase.find({ stateCode: userStateCode })
    .then((requests) => {
      res.send(requests);
    })
    .catch((err) => {
      // console.error("Error: ", err);
      res.status(400).json({ error: "Error Occured" });
    });
});

// view details of a transfer-case request - page
router.get("/view-transfer-case/:reqId", async (req, res) => {
  // console.log("req.params:: ", req.params)
  const userAddress = req.query.userAddress;
  let idParam = req.params["reqId"].replace(/[^0-9]/g, "");
  // console.log("matches:: ", idParam)

  try {
    // Find documents that match the specified conditions
    const matchingRequests = await TransferCase.find({ id: idParam });

    if (matchingRequests.length > 0) {
      const result = matchingRequests[0];

      // When receiving captain opens the request the receive will set to true
      // check if the address of user === toCaptain address (receiving captain)
      if (userAddress == result.toCaptain) {
        // console.log("result.toCaptain:: ", result.toCaptain);
        // Update the receiver field to true
        await TransferCase.updateOne(
          { id: idParam },
          { $set: { receiver: true } }
        );
      }

      // update isOpen - false if request has expired
      // Convert Unix timestamp to JavaScript Date object
      const expiryDate = new Date(result.expiry * 1000);
      //   console.log("expiryDate: ", expiryDate);

      // Get the current date
      const currentDate = new Date();

      // Compare the expiry date with the current date
      if (currentDate > expiryDate) {
        // Update the document's isOpen status to closed
        await TransferCase.updateOne(
          { id: idParam },
          { $set: { isOpen: false } }
        );
      }

      const request = await TransferCase.findOne({ id: idParam });
      //   console.log("request:: ", request);

      // Send the updated or original document to the frontend
      res
        .status(200)
        .json({ message: "Request retrieved successfully", document: request });
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

// sign transfer-case request - push signer address in signers array (if not already exists)
router.post("/view-transfer-case/:reqId", async (req, res) => {
  // console.log("req.params:: ", req.params)
  let idParam = req.params["reqId"].replace(/[^0-9]/g, "");
  // console.log("matches:: ", idParam)

  // Check if userAddress already exists in the signers array
  const isAlreadySigned = await TransferCase.exists({
    id: `${idParam}`,
    signers: req.body.userAddress,
  });
  // console.log("isAlreadySigned:: ", isAlreadySigned)

  if (isAlreadySigned) {
    // If the userAddress already exists, send a message to the frontend
    res.status(200).json({ message: "Already signed" });
  } else {
    // Retrieve the TransferCaptain document to get the value of toCaptain
    const transferCaseDocument = await TransferCase.findOne({
      id: `${idParam}`,
    });

    const updateSignature = {};
    if (req.body.userAddress === transferCaseDocument.toCaptain) {
      updateSignature.signatureToCaptain = req.body.signature;
    } else {
      updateSignature.signatureFromCaptain = req.body.signature;
    }

    // If userAddress/signer doesn't exist, add it to the signers array and add signature into signature's array
    await TransferCase.updateOne(
      { id: `${idParam}` },
      {
        $addToSet: {
          signers: req.body.userAddress,
        },
        $set: updateSignature,
      }
    )
      .then((requests) =>
        res.status(200).json({ message: "Signed successfully" })
      )
      .catch((err) => console.log("errorr:: ", err));
  }
});

router.delete('/delete-transfer-case/:reqId', async (req, res) => {
  let idParam = req.params['reqId'].replace(/[^0-9]/g, "");

  try {
      const deletedRequest = await TransferCase.findOneAndDelete({ 'id': idParam });
      console.log("deletedRequest:: ", deletedRequest)

      if (deletedRequest) {
          res.status(200).json({ message: 'Transfer Case request deleted successfully', deletedRequest });
      } else {
          res.status(404).json({ error: 'Transfer Case request not found' });
      }
  } catch (err) {
      console.error("Error: ", err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;