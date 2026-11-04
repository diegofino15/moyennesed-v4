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

// Logs keyed by ÉcoleDirecte internal account ID (the keys are replaced afterwards, see
// anonymiseBugReportLogs)
function anonymiseAccountKeyedLogs(logs: any): any {
  if (!logs) { return null; }
  const result: any = {};
  for (const [accountID, value] of Object.entries(logs)) {
    result[accountID] = anonymiseForBugReport(value);
  }
  return result;
}


// Internal ÉcoleDirecte account IDs (numeric) : they identify the account on ÉcoleDirecte's side,
// so they are replaced by random numbers, the same way everywhere in one report so that it can
// still be replayed. IDs shorter than this are left alone to avoid replacing unrelated numbers.
const MIN_ACCOUNT_ID_LENGTH = 4;

function _collectAccountIDs(loginLogs: any, marksLogs: any, homeworkLogs: any): Set<string> {
  const ids = new Set<string>();
  const add = (value: any) => {
    if (value === null || value === undefined) { return; }
    const id = String(value);
    if (id.length >= MIN_ACCOUNT_ID_LENGTH) { ids.add(id); }
  };

  loginLogs?.data?.accounts?.forEach((account: any) => {
    add(account?.id);
    account?.profile?.eleves?.forEach((eleve: any) => add(eleve?.id));
  });
  Object.keys(marksLogs ?? {}).forEach(add);
  Object.keys(homeworkLogs ?? {}).forEach(add);
  return ids;
}

// New random IDs for this report only (nothing here needs to be unpredictable, they just must not
// be derived from the real ones)
function _randomIDs(realIDs: Set<string>): Map<string, string> {
  const mapping = new Map<string, string>();
  const used = new Set<string>(realIDs);
  realIDs.forEach(realID => {
    let fakeID: string;
    do { fakeID = String(100000000 + Math.floor(Math.random() * 900000000)); } while (used.has(fakeID));
    used.add(fakeID);
    mapping.set(realID, fakeID);
  });
  return mapping;
}

// Deep copy where every key or value equal to a known account ID is replaced (numbers stay numbers)
function _replaceIDs(data: any, mapping: Map<string, string>): any {
  if (Array.isArray(data)) { return data.map(item => _replaceIDs(item, mapping)); }
  if (data !== null && typeof data === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[mapping.get(key) ?? key] = _replaceIDs(value, mapping);
    }
    return result;
  }
  if ((typeof data === "number" || typeof data === "string") && mapping.has(String(data))) {
    const fakeID = mapping.get(String(data)) as string;
    return typeof data === "number" ? Number(fakeID) : fakeID;
  }
  return data;
}

// Everything that goes in a bug report : secrets and personal data removed, and the ÉcoleDirecte
// account IDs replaced by random ones (identical in the three logs)
function anonymiseBugReportLogs({ login, marks, homework }: { login: any, marks: any, homework: any }): { login: any, marks: any, homework: any } {
  const mapping = _randomIDs(_collectAccountIDs(login, marks, homework));
  return {
    login: _replaceIDs(anonymiseForBugReport(login), mapping),
    marks: _replaceIDs(anonymiseAccountKeyedLogs(marks), mapping),
    homework: _replaceIDs(anonymiseAccountKeyedLogs(homework), mapping),
  };
}

export { stripSecrets, anonymiseForBugReport, anonymiseAccountKeyedLogs, anonymiseBugReportLogs };
