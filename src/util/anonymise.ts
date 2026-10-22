// Helpers used to remove secrets and personal data from ÉcoleDirecte API responses
// before they are kept as debug logs or sent in a bug report.


// Session secrets : never stored in logs
const SECRET_KEYS = new Set(["token", "2fa-token", "cn", "cv", "motdepasse", "password"]);

// Personal or identifying data : blanked in bug reports
const PERSONAL_KEYS = new Set([
  // Identity
  "identifiant", "email", "prenom", "nom", "particule", "civilite", "telPortable", "telPortableConjoint",
  "photo", "sexe", "dateNaissance", "uid", "idLogin", "idReelEtab",
  // School
  "nomEtablissement", "idEtablissement", "rneEtablissement", "codeOgec", "nomPP", "nomCE",
  // Teachers and free-text written about the student
  "nomProf", "donneePar", "appreciations", "appreciationGenerale", "LSUN",
]);


// Empty value of the same type, so code replaying the logs does not crash
function _emptyLike(value: any): any {
  if (Array.isArray(value)) { return []; }
  if (value !== null && typeof value === "object") { return {}; }
  return "";
}

// Deep copy of `data` where the given keys are removed (or emptied)
function _strip(data: any, keys: Set<string>, removeKeys: boolean): any {
  if (Array.isArray(data)) { return data.map(item => _strip(item, keys, removeKeys)); }
  if (data === null || typeof data !== "object") { return data; }

  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (keys.has(key)) {
      if (!removeKeys) { result[key] = _emptyLike(value); }
      continue;
    }
    result[key] = _strip(value, keys, removeKeys);
  }
  return result;
}

// Remove session tokens, used before saving any API response as a local log
function stripSecrets(data: any): any {
  return _strip(data, SECRET_KEYS, true);
}

// Remove secrets and personal data, used before sending a bug report
function anonymiseForBugReport(data: any): any {
  return _strip(stripSecrets(data), PERSONAL_KEYS, false);
}

// Logs keyed by ÉcoleDirecte internal account ID (kept, so that the report can still be
// replayed against the login logs : it is a numeric ID, not the username)
function anonymiseAccountKeyedLogs(logs: any): any {
  if (!logs) { return null; }
  const result: any = {};
  for (const [accountID, value] of Object.entries(logs)) {
    result[accountID] = anonymiseForBugReport(value);
  }
  return result;
}

export { stripSecrets, anonymiseForBugReport, anonymiseAccountKeyedLogs };
