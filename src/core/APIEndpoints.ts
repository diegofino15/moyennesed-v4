// This enum contains all the endpoints of the api used in the app
class APIEndpoints {
  static OFFICIAL_API = "https://api.ecoledirecte.com";
  static CUSTOM_API = process.env.EXPO_PUBLIC_API_URL;

  static LOGIN = "/v3/login.awp";
  static RENEW_TOKEN = "/v3/renewtoken.awp";
  static MARKS(accountID: string) { return `/v3/eleves/${accountID}/notes.awp`; };
  static ALL_HOMEWORK(accountID: string) { return `/v3/Eleves/${accountID}/cahierdetexte.awp`; }
  static SPECIFIC_HOMEWORK(accountID: string, day: string) { return `/v3/Eleves/${accountID}/cahierdetexte/${day}.awp`; }
  static DOWNLOAD_HOMEWORK_ATTACHEMENT(fileID: string, fileType: string) { return `/v3/telechargement.awp?verbe=get&fichierId=${fileID}&leTypeDeFichier=${fileType}`; }
}

export default APIEndpoints;