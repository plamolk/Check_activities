// src/services/testRms.js
const { rmsLogin } = require("./rms.services");

(async () => {
  try {
    const result = await rmsLogin("USERNAME", "PASSWORD");
    console.log(result);
  } catch (err) {
    console.error("RMS ERROR:", err.message);
  }
})();