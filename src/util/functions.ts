import {
  type Request as UnsafeRequest,
  defaultFetcher,
  getCookiesFromResponse,
} from "@literate.ink/utilities";
import axios from "axios";

// Get token for login
async function getGtkToken(): Promise<string> {
  var gtk: string;
  var gtkUrl = new URL("https://api.ecoledirecte.com/v3/login.awp");
  gtkUrl.searchParams.set("gtk", "1");
  gtkUrl.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  const request = {
    url: gtkUrl,
    method: "GET",
    headers: { "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT },
  };
  const response = await defaultFetcher(request as UnsafeRequest);
  const cookies = getCookiesFromResponse(response);
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === "GTK") { gtk = value; }
  }
  return gtk;
}

// Do the login
async function doLogin(username: string, password: string, gtk: string, cn: string, cv: string, onError: Function) {
  var url = new URL("https://api.ecoledirecte.com/v3/login.awp");
  url.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
    "X-GTK": gtk,
    "Cookie": `GTK=${gtk}`,
  };
  const body = {
    identifiant: username,
    motdepasse: encodeURIComponent(password),
    isReLogin: false,
    uuid: "",
    fa: [{ cn, cv }],
    cn, cv
  };

  const response = await axios.post(
    url.toString(),
    `data=${JSON.stringify(body)}`,
    { headers: headers }
  ).then((response) => {
    return response;
  }).catch((error) => {
    console.log(error);
    onError(error);
    return;
  });

  return response;
}

export { getGtkToken, doLogin };