import { TIMEOUT_SEC } from "./config";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// If there is no upload data then it is send otherwise get.
export const AJAX = async function (url, uploadData = undefined) {
  const fetchPro = uploadData ? fetch(url, {
    method: 'POST',
    headers: {
      // Here, we specify that the data we're gonna send is 
      'Content-Type': 'application/json'
    },
    // The data we want to send (must be in JSON)
    body: JSON.stringify(uploadData),
  }) : fetch(url);

  try {
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    return data;
  } catch (err) {
    // This will pass the error to the model.js's catch blocko 
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    // If timeout wins then the error will be thrown to the catch block and be logged as an error.
    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    return data;
  } catch (err) {
    // This will pass the error to the model.js's catch blocko 
    throw err;
  }
};
*/

export const sendJSON = async function (url, uploadData) {
  try {
    // If timeout wins then the error will be thrown to the catch block and be logged as an error.
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        // Here, we specify that the data we're gonna send is 
        'Content-Type': 'application/json'
      },
      // The data we want to send (must be in JSON)
      body: JSON.stringify(uploadData),
    });
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    return data;
  } catch (err) {
    // This will pass the error to the model.js's catch blocko 
    throw err;
  }
}; 