import express from 'express';
const mongoose = require('mongoose');

const newCasechema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true
  },
  initiator: {
    type: String,
    required: true
  }
});

const NewCase = mongoose.model('NewCase', newCasechema);

export async function insert(data) {
    await NewCase.insertMany({
        "caseId": data.caseId,
        "initiator": data.initiator
    })
}

module.exports = {
    insert: insert
};