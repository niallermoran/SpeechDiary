const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const textsdk = require('@azure/ai-text-analytics');
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");


require('dotenv').config();

const port = process.env.PORT || 5000; // after deploying to azure make sure there is an appsetting for port 80/443
const key = process.env.SPEECH_KEY;
const region = process.env.SPEECH_REGION;
const text_key = process.env.TEXT_KEY;
const text_endpoint = process.env.TEXT_ENDPOINT;

const textAnalyticsClient = new TextAnalyticsClient(text_endpoint, new AzureKeyCredential(text_key));
const path = require("path");

app.use(express.static(path.join(__dirname, 'public')))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

// this method will return a secure token that can be used to stream speech to the speechsdk
app.get('/api/token', async(req, res) => {
    var token = undefined;
    try {

        const headers = {
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const url = "https://" + region  + ".api.cognitive.microsoft.com/sts/v1.0/issueToken";

        try {
            const tokenResponse = await axios.post(url, null, headers);
            res.send({ authToken: tokenResponse.data,  region: process.env.SPEECH_REGION , port: port, error: undefined });
        } catch (err) {
            res.send({ authToken: null, error: "There was an error authorizing your speech key: " + url +":" + headers });
        }
    } catch (err) {
        if( err.response )
            res.send( { authToken: null, error: err.response.data });
        else
            res.send( { authToken: null, error: err });
    }
});

// this api method will simply take a piece of text and return a sentiment (0-1) and mood index
app.get('/api/sentiment:text', async(req, res) => {
    const documents = [req.params.text];
    const sentimentresults = await textAnalyticsClient.analyzeSentiment(documents);
    res.send( sentimentresults );
});

// this api method will simply take a piece of text and return the important kewords from it
app.get('/api/keywords:text', async(req, res) => {
    const documents = [req.params.text];
    const phraseresults = await textAnalyticsClient.extractKeyPhrases(documents);
    res.send( phraseresults );
});

app.listen(port, () => console.log(`Listening on port ${port}`));