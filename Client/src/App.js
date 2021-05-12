import React, { Component } from 'react';
import { Container } from 'reactstrap';
import './App.css';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import GoogleLogin from 'react-google-login'; // see https://www.npmjs.com/package/react-google-login
import { GoogleLogout } from 'react-google-login';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');
const google_client_id = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default class SpeechDiaryComponent extends Component {
  constructor(props) {

    super(props);

    this.state = {
      displayText: 'Click the green mic to record your symptoms',
      loggedIn: false,
      name: null,
      speechText: '',
      isHappy: false,
      isNeutral: false,
      isSad: false,
      phrases: null,
      moodScore: null
    }
  }


  async extractPhrasesandandSentimentFromSpeech(text) {

    this.state.isNeutral = false;
    this.state.isHappy = false;
    this.state.isSad = false;
    this.state.moodScore = null;

    this.setState({ keyphrases: null });

    var response = await fetch(`/api/sentiment:${text}`);
    const sentimentjson = await response.json();

    for (const senresult of sentimentjson) {
      if (senresult.error === undefined) {
        const pos = senresult.confidenceScores.positive;
        const neg = senresult.confidenceScores.negative;
        var score = 0;

        this.setState({ moodScore: score * 100 });
        if (senresult.sentiment === "negative") {
          this.setState({ moodScore: (100 - (neg * 100)) });
          this.setState({ isSad: true });
        }
        else if (senresult.sentiment === "positive") {
          this.setState({ moodScore: pos * 100 });
          this.state.isHappy = true;
          this.setState({ isNeutral: true });
        }
        else {
          this.setState({ isNeutral: true });
          this.setState({ moodScore: 50 });
        }
      } else {
        console.log("Encountered an error:", senresult.error);
      }
    }

    // get phrases
    response = await fetch(`/api/keywords:${text}`);
    const phraseresults = await response.json();
    const array = [];
    for (const phraseresult of phraseresults) {
      for (const phrase of phraseresult.keyPhrases) {
        array.push(phrase);
      }
    }

    this.setState({ keyphrases: array });


  }


  async startListening() {

    // start by getting an auth token from the API
    const response = await fetch("/api/token");
    const body = await response.json();
    const token = body.authToken;
    const region = body.region;

    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    this.setState({
      displayText: 'speak into your microphone...',
      speechText: '',
      isSad: false,
      isHappy: false,
      isNeutral: false,
      keyphrases: null,
      moodScore: null
    });

    recognizer.recognizeOnceAsync(result => {
      let displayText;
      let speechText;
      if (result.reason === ResultReason.RecognizedSpeech) {
        speechText = `${result.text}`;
        displayText = 'Speech recognised';
        try {
          this.extractPhrasesandandSentimentFromSpeech(result.text);
        }
        catch (e) {
          console.log(e.ResultReason);
        }
      } else {
        displayText = `Oops, speech was cancelled or could not be recognized. Ensure your microphone is working properly. ${result.reason}`;
      }

      this.setState({
        displayText: displayText,
        speechText: speechText
      });
    });

  }

  renderKeyPhrases() {
    const phrases = this.state.keyphrases;

    if (phrases != null) {
      return (
        <div>
          {
            phrases.map(((phrase) => (
              <p>{phrase}</p>
            )))
          }
        </div>
      );
    }
  }

  // when the user logs in we need to deal with the response
  responseGoogleSuccess = (response) => {
    this.setState({ loggedIn: true });
    this.setState({ name: response.profileObj.givenName });
    console.log(response);
  }

  responseGoogleFailed = (response) => {
    this.setState({ loggedIn: false });
    this.setState({ name: null });
    console.log('failed to logged_in: ' + response.details);
  }

  responseGoogleLogout = (response) => {
    this.setState({ loggedIn: false });
    this.setState({ name: null });
    console.log(response);
  }


  render() {

    return (
      <Container>
        <div className="App">
          <div>
            <div class="text-center" >
              <img src="cropped-parkinsonsfavicon-180x180.png" className="App-logo" alt="logo" />
              <h1 className="display-10 mb-3">Parkinson's Speech Diary</h1>
            </div>
            <div className="text-center">
              <div >
                <i className="fas fa-microphone fa-3x" onClick={() => this.startListening()}></i>
              </div>
            </div>


            <div className="text-center">
              <div >
                {this.state.displayText}
              </div>
            </div>


            {
              this.state.name ?
                <div className="text-center">
                  <div >
                    Hi {this.state.name}!
              </div>
                </div> : null}

            {
              this.state.google_client_id ? (
              this.state.loggedIn ?
                <GoogleLogout
                  clientId={google_client_id}
                  buttonText="Logout"
                  isSignedIn="false"
                  onLogoutSuccess={this.responseGoogleLogout}
                /> :

                <GoogleLogin
                  clientId={google_client_id}
                  buttonText="Login with Google"
                  loginHint="Login using your Google account to save diary entries"
                  isSignedIn="true"
                  theme="blue"
                  onSuccess={this.responseGoogleSuccess}
                  onFailure={this.responseGoogleFailed}
                  cookiePolicy={'single_host_origin'}
                /> )
                :
                null
            }

            <div class="w-100 mx-auto">
              <div className="output-display rounded" >
                <code>{this.state.speechText}</code>
              </div>
            </div>

            {
              this.state.isHappy ?
                <div className="text-center" id="happy_icon">
                  <div >
                    <i className="fas fa-smile fa-lg mr-2" />
                  </div>
                </div> : null
            }

            {
              this.state.isSad ?
                <div className="text-center" id="sad_icon">
                  <div >
                    <i className="fas fa-sad-tear fa-lg mr-2" />
                  </div>
                </div> : null
            }



            {this.state.moodScore != null ?
              <div class="w-100">

                <div className="text-center">
                  <div >
                    Mood Score
                        </div>
                  {
                    this.state.isHappy ?
                      <div class="mood goodmood" id="mood_score">
                        {this.state.moodScore}
                      </div>
                      :
                      <div class="mood badmood" id="mood_score">
                        {this.state.moodScore}%
                                    </div>
                  }

                </div>

              </div> : null
            }


            {
              this.state.keyphrases != null ?
                <div class="w-100">

                  <div className="text-center">
                    <div >
                      <b>Extracted Topics</b>
                    </div>
                  </div>

                  <div className="output-display rounded" >
                    {this.renderKeyPhrases()}
                  </div>
                </div>
                : null
            }

          </div>

        </div>

      </Container>
    );
  }

}
