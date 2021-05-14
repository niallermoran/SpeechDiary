const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const textsdk = require('@azure/ai-text-analytics');
const jwt = require('jsonwebtoken');
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

const port = process.env.REACT_APP_PORT || 5000; // after deploying to azure make sure there is an appsetting for port 80/443
const key = process.env.REACT_APP_SPEECH_KEY;
const region = process.env.REACT_APP_SPEECH_REGION;
const text_key = process.env.REACT_APP_TEXT_KEY;
const text_endpoint = process.env.REACT_APP_TEXT_ENDPOINT;
const privateKey = process.env.REACT_APP_PRIVATE_KEY;

const textAnalyticsClient = new TextAnalyticsClient(text_endpoint, new AzureKeyCredential(text_key));
const path = require("path");

app.use(express.static(path.join(__dirname, 'public')))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// this method will return an Azure secure token that can be used to stream speech to the Azure speechsdk from the client
app.get('/api/token', async (req, res) => {

    const accesstoken = req.headers['x-access-token'];
    if (!accesstoken) return res.status(401).send({ auth: false, message: 'No access token provided.' });

    // verify the token using the secret key that has been shared with the client
    jwt.verify(accesstoken, privateKey, async function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
        else {
            var token = undefined;
            try {

                const headers = {
                    headers: {
                        'Ocp-Apim-Subscription-Key': key,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                const url = "https://" + region + ".api.cognitive.microsoft.com/sts/v1.0/issueToken";

                try {
                    const tokenResponse = await axios.post(url, null, headers);
                    res.status(200).send({ authToken: tokenResponse.data, region: region, port: port, error: undefined });
                } catch (err) {
                    res.status(500).send({ authToken: null, error: "There was an error authorizing your speech key: " + url + ":" + headers });
                }
            } catch (err) {
                if (err.response)
                    res.status(500).send({ authToken: null, error: err.response.data });
                else
                    res.status(500).send({ authToken: null, error: err });
            }
        }
    });


});

// this api method will simply take a piece of text and return a sentiment (0-1) and mood index
app.get('/api/sentiment:text', async (req, res) => {

    // look for JWT to ensure the API is being called from a reliable source
    const documents = [req.params.text];
    const accesstoken = req.headers['x-access-token'];

    if (!accesstoken) return res.status(401).send({ auth: false, message: 'No access token provided.' });

    // verify the token using the secret key that has been shared with the client
    jwt.verify(accesstoken, privateKey, async function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        else {
            sentimentresults = await textAnalyticsClient.analyzeSentiment(documents);
            res.status(200).send(sentimentresults);
        }

    });


});

// this api method will simply take a piece of text and return the important kewords from it
app.get('/api/keywords:text', async (req, res) => {

    const documents = [req.params.text];
    const accesstoken = req.headers['x-access-token'];

    if (!accesstoken) return res.status(401).send({ auth: false, message: 'No access token provided.' });

    // verify the token using the secret key that has been shared with the client
    jwt.verify(accesstoken, privateKey, async function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        else {
            results = await textAnalyticsClient.extractKeyPhrases(documents);
            res.status(200).send(results);
        }

    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));