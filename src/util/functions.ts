import axios from "axios";


// Get token for login
async function getGtkToken(): Promise<{ gtk: string; cookie: string } | null> {
  var gtkUrl = new URL("https://api.ecoledirecte.com/v3/login.awp");
  gtkUrl.searchParams.set("gtk", "1");
  gtkUrl.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);

  const response = await axios.get(gtkUrl.toString(), { headers: {
    "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
  } }).catch(err => {
    console.warn("An error occured while getting GTK : " + err);
  });
  if (response == null) { return null; }

  // Parse GTK
  var gtks = []
  for (const token of response["headers"]["set-cookie"]) {
    let gtk = token.split(";")[0]
    gtks.push(gtk)
  }

  return {
    gtk: gtks[0].split("=")[1],
    cookie: gtks[0].concat(";").concat(gtks[1]),
  }
}

// Do the login
async function doLogin(username: string, password: string, gtk: string, cookie: string, twoFAToken:string, cn: string, cv: string, onError: Function, urlBase: string) {
  var url = new URL(`${urlBase}/v3/login.awp`);
  url.searchParams.set("v", process.env.EXPO_PUBLIC_ED_API_VERSION);
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": process.env.EXPO_PUBLIC_ED_USER_AGENT,
    "X-GTK": gtk,
    "Cookie": cookie,
    "2fa-Token": twoFAToken
  };
  const body = {
    identifiant: encodeURIComponent(username),
    motdepasse: encodeURIComponent(password),
    isReLogin: false,
    uuid: "",
    fa: [{ cn: cn, cv: cv }],
    cn: cn, cv: cv
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