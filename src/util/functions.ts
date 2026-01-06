import { Platform } from "react-native";
import { fetch } from "react-native-ssl-pinning";
import axios from "axios";

import StorageHandler from "../core/StorageHandler";
import APIEndpoints from "../core/APIEndpoints";


// Parse ÉcoleDirecte
function useIOSFetch(url: string): boolean { return Platform.OS == "ios" && url.substring(0, 28) == APIEndpoints.OFFICIAL_API; }

function fetchED(url: string, { method, headers, body=null }) {
  if (useIOSFetch(url)) {
    return fetch(url, {
      method: method,
      sslPinning: { certs: [] },
      
      headers: headers,
      body: (body == null) ? undefined : body,
      disableAllSecurity: true,
    });
  } else {
    if (method == "GET") {
      return axios.get(url, { headers: headers });
    } else {
      return axios.post(url, { headers: headers, data: body });
    }
  }
}


// Get token for login
async function getGtkToken(urlBase: string): Promise<{ gtk: string; cookie: string }> {
  var url = new URL(`${urlBase}/v3/login.awp`);
  url.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  url.searchParams.set("gtk", "1");
  
  try {
    const response = await fetchED(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "identity",
        "Host": "api.ecoledirecte.com",
        "Connection": "keep-alive",
      },
    });

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
    fa: [{ cn: cn, cv: cv }],
    cn: cn, cv: cv
  };
  
  const loginResponse = await fetchED(url.toString(), {
    method: "POST",
    body: `data=${JSON.stringify(body)}`,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
      "X-Gtk": gtk ?? "---",
      "Cookie": cookie ?? "---",
      "Accept-Encoding": "gzip, compress, deflate, br",
      "Host": "api.ecoledirecte.com",
      "Connection": "keep-alive",
      "2fa-Token": twoFAToken,
    },
  }).then(async (response) => {
    return {
      status: 200,
      data: useIOSFetch(url.toString()) ? (await response.json()) : response.data,
      headers: response.headers,
    };
  }).catch((error) => {
    onError(error);
    return;
  });

  return loginResponse;
}

export { getGtkToken, doLogin, fetchED, useIOSFetch };