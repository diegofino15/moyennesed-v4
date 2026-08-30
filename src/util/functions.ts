import axios from "axios";

import StorageHandler from "../core/StorageHandler";


// Parse ÉcoleDirecte
function fetchED(url: string, method: string, headers: any, body:string|null=null) {
  if (method == "GET") {
    return axios.get(url, { headers: headers });
  } else {
    return axios.post(url, body, { headers: headers });
  }
}


// Get token for login
async function getGtkToken(urlBase: string): Promise<{ gtk: string; cookie: string }> {
  var url = new URL(`${urlBase}/v3/login.awp`);
  url.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  url.searchParams.set("gtk", "1");
  
  try {
    const response = await fetchED(url.toString(),
      "GET",
      {
        "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Origin": "https://www.ecoledirecte.com",
        "Referer": "https://www.ecoledirecte.com/"
      },
    );

    var res = { gtk: "", cookie: "" };
    const setCookieHeader = response.headers["Set-Cookie"] || response.headers["set-cookie"];
    const cookiePart = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
    
    // Parse GTK
    const XGTK = cookiePart.split(", ")[0].split(";")[0].split("=")[1];
    const cookie = `GTK=${XGTK};${cookiePart.split(", ")[1].split(";")[0]}`;

    res = { gtk: XGTK, cookie: cookie };
    await StorageHandler.saveData("gtk", res);

    return res;
  } catch (e) {
    console.warn("An error occured while getting GTK : ", e);
    return { gtk: "", cookie: "" };
  }
}

// Do the login
async function doLogin(username: string, password: string, gtk: string, cookie: string, twoFAToken:string, cn: string, cv: string, onError: Function, urlBase: string) {
  var url = new URL(`${urlBase}/v3/login.awp`);
  url.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  
  const body = {
    identifiant: encodeURIComponent(username),
    motdepasse: encodeURIComponent(password),
    isReLogin: false,
    uuid: "",
    fa: [{ cn: cn, cv: cv, uniq: false }]
  };
  
  const loginResponse = await fetchED(url.toString(),
    "POST",
    {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
      "X-Gtk": gtk ?? "---",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "Origin": "https://www.ecoledirecte.com",
      "Referer": "https://www.ecoledirecte.com/",
      "Priority": "u=1, i",
      "2fa-Token": twoFAToken,
    },
    `data=${JSON.stringify(body, null, 4)}`
  ).then(async (response: any) => {
    return {
      status: 200,
      data: response.data,
      headers: response.headers,
    };
  }).catch((error: any) => {
    onError(error);
    return;
  });

  return loginResponse;
}

export { getGtkToken, doLogin, fetchED };