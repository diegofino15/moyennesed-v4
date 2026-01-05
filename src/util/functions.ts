import axios from "axios";


// Get token for login
async function getGtkToken(urlBase: string): Promise<{ gtk: string; cookie: string } | null> {
  var url = new URL(`${urlBase}/v3/login.awp`);
  url.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  url.searchParams.set("gtk", "1");
  
  const gtkResponse = await axios.get(
    url.toString(),
    { headers: {
      "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, compress, deflate, br",
      "Host": "api.ecoledirecte.com",
      "Connection": "keep-alive",
    } }
  );

  // Parse GTK (won't work for long)
  const XGTK = gtkResponse.headers["set-cookie"][0].split(", ")[0].split(";")[0].split("=")[1];
  const cookie = `GTK=${XGTK};${gtkResponse.headers["set-cookie"][0].split(", ")[1].split(";")[0]}`

  return { gtk: XGTK, cookie: cookie }
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
  
  // Real login request
  const loginResponse = await axios.post(
    url.toString(),
    `data=${JSON.stringify(body)}`,
    { headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
      "X-Gtk": gtk,
      "Cookie": cookie,
      "Accept-Encoding": "gzip, compress, deflate, br",
      "Host": "api.ecoledirecte.com",
      "Connection": "keep-alive",
      "2fa-Token": twoFAToken,
    } }
  ).then((response) => {
    return response;
  }).catch((error) => {
    console.log(error);
    onError(error);
    return;
  });

  return loginResponse;
}

export { getGtkToken, doLogin };