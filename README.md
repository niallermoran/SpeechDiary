# SpeechDiary

The speech diary was created as part of an Alliance for good Ireland initiative which consisted of a number of companies, led by Microsoft, coming together to hack a solution to a problem for the Parkinsons Association of Ireland. One of the components of the prototype delivered was a speech diary that would ultimately allow people to record a diary of their symptoms. The diary would track the person's mood and key topics over time. 

The solution uses a simple REACT HTML/Javascript front end that calls nodejs services running on a server. These services use Azure Cognitive Services to determine the sentiment of the diary entries as well as extract key topics from the text. 

The following guide will define how to load the code on your local development environment for debugging as well as deploy the code to Azure for production use. The guide assumes you are using Visual Studio Code, but you can adapt to your own environment accordingly.

## Setup Azure Resources

In order to deploy the solution you will need an Azure Web App that supports node 12 on Linux. You will also need a cognitive services resource that supprts the speech sdk and text analytics.

1. Create a new web app in Azure using Linux as the OS and node 12 LTS as the runtime stack.
2. Add all settings to the app using the configuration tab. Create all settings from the sample.env files in both client and server. 
3. Make sure the setting REACT_APP_PORT is set to 8080 as this is the port Azure uses to ensure the web app container is operational.
4. Create a cognitive services resource and take note of the region (overview tab in portal and click 'json view' to get the correct string for region/location) as well as endpoint url and key from the 'keys and endpoint' tab in the portal.

## Setting up Development Environment - Server APIs

1. Clone the repo locally.
2. Open the server folder in VS code.
3. In a terminal window run npm install to download all required packages
4. Copy the file sample.env to a new file called .env. Ensure that the new file (.env) is added to your git ignore file list and do not update sample.env.
4. Open the file .env and update the properties based on the values from Azure resources noted in previous section. This file contains secrets used only for development, do not allow this file to end up in your Github account.
5. In a terminal window type npm run dev. You should see a message saying "listening on port 3400" (or something different if you changed the port number). You may also see an error about no such file or director for index.html. You can ignore this error for now.
6. To test if the server API is working open a browser and navigate to localhost:3400/api/token. This should return a json file with a token value as well as region and port. If this works then the api is working.
7. To stop the server go back to the terminal window in VS code and hit CTRL-C twice. However, if you want to the test the REACT front end you should leave the server running.

## Setting up Development Environment - REACT Client

The client application is a single page dynamic web application built using REACT. To load the app and test it follow the below guide.

1. Open the contents of the client folder in VS code.
2. In a terminal window in VS code type npm install to download all required packages.
3. Open the file 'package.json' and at the bottom change the proxy url to include the correct port as defined in the previous section, e.g. 3400. This will tell the REACT app where to go for server side calls. This will only be needed for development work.
4. Copy the file sample.env to a new file called .env. Ensure that the new file (.env) is added to your git ignore file list and do not update sample.env.
5. Open the file .env and update the properties. Please navigate to https://developers.google.com/identity/sign-in/web/sign-in to create a Google App to add Google sign-in capability
6. In a terminal npm run start. This will run an express web server and launch localhost:3000 with the client app working. Ensure that the server app is running from the previous section. This will mean having two instances of VS Code running.
7. Test the application by clicking the microphone and allowing your browser to access your mic. Say a sentence and ensure the text is recognised and a mood score given.

## Deploying the App to Azure

The server and client app need to be deployed to the same Azure web app. To do this you will build the client app and then deploy it with the server app to Azure. Do not deploy the two seperately.

1. Open the client app VS code instance and type npm run build.
2. You should now see a 'build' folder within VS Code. 
3. Copy the contents of this folder to the public folder within the server folder. Make sure you copy the contents and not the build folder. 
4. Now close VS Code containg the client app and return to VS code containing the server code.
5. If the server is still running press CTRL-C twice to stop it and you now should see a public folder in VS Code that contains a number of files including index.html.
6. Run the server again by typing npm run dev in the terminal window. Again the console should say 'listening on port 3004' but this time you should not see an error about index.html as it is now present.
7. Open localhost:3400 and you should now see the client app. Test it to esnure the client app is successfully connecting to the server API.
8. In VS code click the Azure button on the toolbar. If this doesn't exist please add the Azure resources, Azure app service extensions for VS Code.
9. Navigate to the resource group and web app created in the previous section. Right click the web app and click deploy to web app. Select the server folder when prompted for a source and say yes and deploy.
10. You can now open you Azure web app and you should see the client app functioning correctly.


