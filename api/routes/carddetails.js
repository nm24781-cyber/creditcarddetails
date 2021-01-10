const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient();
const uri = "mongodb+srv://NEERAJ:QcKvleCQ4oEDHMXx@cluster0.l1qrv.mongodb.net/CREADITCARDDETAILS?retryWrites=true&w=majority";

mongoose.connect(process.env.MONGODBURI||uri, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("DB connection successful");
}).catch(e => {
    throw "DB Connection Unsuccessful";
})

const CardDetailsSchema = new mongoose.Schema({
    expDate: String,
    cvCode: String,
    cardNumber: String,
    cardOwner: String
});

const CardDetailsModel = mongoose.model('carddetailsmodel', CardDetailsSchema);
const cardNumberRegex = RegExp(/^([0-9]{16})$/);
const cvCodeRegex = RegExp(/^([0-9]{3})$/);
const cardOwnerRegex = RegExp(/^[a-zA-Z ]*$/);
const dateRegex = RegExp(/^(0?[1-9]|1[012])[/]\d{4}$/);
let message = "";
const isvalidDetails = (Details) => {
    if (!cardNumberRegex.test(Details.cardNumber) ||
        !cvCodeRegex.test(Details.cvCode) ||
        !cardOwnerRegex.test(Details.cardOwner) ||
        !dateRegex.test(Details.expDate)) {
        message = "NOT VALID DETAILS";
        throw "NOT VALID DETAILS"
    }
    return true
}
/* POST CARD DETAILS. */
router.post('/', function (req, res, next) {
    try {
        const {cardDetails} = req.body
        if (isvalidDetails(cardDetails)) {
            const detailsDOC = new CardDetailsModel({
                expDate: cardDetails.expDate,
                cvCode: cardDetails.cvCode,
                cardNumber: cardDetails.cardNumber,
                cardOwner: cardDetails.cardOwner
            });

            detailsDOC.save(function (err, detail) {
                if (err) {
                    res.status(400);
                    res.json("Failure In Posting Details");
                    res.send();
                } else {
                    res.status(200);
                    res.json("Details Posted Successfully");
                    res.send();
                }
            })
        }
    } catch (e) {
        res.status(400);
        res.json(`${message}`);
        res.send();
    }
});

module.exports = router;
