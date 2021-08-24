
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const qs = require('query-string');
app.use(cors());


const urlToGetLinkedInAccessToken = 'https://www.linkedin.com/oauth/v2/accessToken';
const urlToGetUserProfile ='https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))'
const urlToGetOrgDetails = 'https://api.linkedin.com/v2/organizationalEntityAcls?q=members&projection=(elements*(primary,type,handle~))';

app.get('/getUserCredentials', function (req, res) {
  const user = {};
  const code = req.query.code;
  const accessToken = getAccessToken(code);
  const userProfile = getUserProfile(accessToken);
  const userEmail = getOrgDetails(accessToken);
  let resStatus = 400;
  if(!(accessToken === null || userProfile === null || userEmail === null)) {
    user = userBuilder(userProfile, userEmail);
    resStatus = 200;
  }
res.status(resStatus).json({ user });
})

function getAccessToken(code) {
  let accessToken = null;
  const config = {
    headers: { "Content-Type": 'application/x-www-form-urlencoded' }
  };
  const parameters = {
    "grant_type": "authorization_code",
    "code": code,
    "redirect_uri": 'http://localhost:3000/linkedin',
    "client_id": '782hh73qt4koku',
    "client_secret": 'kUEq53AhOhtKJHKI',
  };
  axios
    .post(
      urlToGetLinkedInAccessToken,
      qs.stringify(parameters),
      config)
    .then(response => {
        console.log(response)
      accessToken = response.data["access_token"];
    })
    .catch(err => {
      console.log("Error getting LinkedIn access token");
    })
    return accessToken;
}

function getUserProfile(accessToken) {
  let userProfile = null;
  const config = {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }
  axios
    .get(urlToGetUserProfile, config)
    .then(response => {
      userProfile.firstName = response.data["localizedFirstName"];
      userProfile.lastName = response.data["localizedLastName"];
      userProfile.profileImageURL = response.data.profilePicture["displayImage~"].elements[0].identifiers[0].identifier;
    })
    .catch(error => console.log("Error grabbing user profile"))
  return userProfile;
}


function getOrgDetails(accessToken) {
  const email = null;
  const config = {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  };
  axios
    .get(urlToGetOrgDetails, config)
    .then(response => {
      email = response.data.elements[0]["handle~"];
    })
    .catch(error => console.log("Error getting user email"))

  return email;
}

function userBuilder(userProfile, userEmail) {
  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userEmail
  }
}

app.listen(8080, function () {
  console.log(`Node server running...`)
});