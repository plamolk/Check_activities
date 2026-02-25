// src/services/rms.services.js
const axios = require("axios");
const https = require("https");

const RMS_URL = "https://rms.bncc.ac.th/api/pornchai/api.php";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function rmsLogin(username, password) {
  const response = await axios.get(RMS_URL, {
    httpsAgent,
    headers: {
      "Accept": "*/*",
      "X-Application-Request": "pornjira",
      "X-Application-Key": "32ec3d9bec382ca253b8230a0d9b33c4",
      "X-Application-Name": "check_auth_rms",
      "X-Application-Parameter": `${username}----${password}`
    },
    timeout: 10000
  });

  return response.data;
}

module.exports = { rmsLogin };