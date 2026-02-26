const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const RMS_URL = "https://rms.bncc.ac.th/api/pornchai/api.php";

async function test() {
  const response = await axios.get(RMS_URL, {
    httpsAgent,
    headers: {
      "X-Application-Request": "pornjira",
      "X-Application-Key": "32ec3d9bec382ca253b8230a0d9b33c4",
      "X-Application-Name": "copy_student_data",
      "X-Application-Parameter": "0"
    }
  });

  console.log(response.data);
}

test();