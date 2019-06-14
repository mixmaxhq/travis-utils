import Octokit from '@octokit/rest';

let auth = process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : null,
  authChanged = false,
  client = null;

/**
 * Parse the given environment variable as an integer.
 *
 * @param {string} variableName
 * @param {*} defaultValue The value to use if the variable isn't defined.
 * @return {number} The parsed integer.
 * @throws {TypeError} If the variable is provided and isn't a valid integer.
 */
function getEnvInt(variableName, defaultValue = null) {
  const value = process.env[variableName];
  if (['false', '', undefined, null].includes(value)) {
    return defaultValue;
  }
  const intVal = parseInt(value, 10);
  if (!Number.isSafeInteger(intVal)) {
    throw new TypeError(`expected integer for ${variableName}`);
  }
  return intVal;
}

const slug = process.env.TRAVIS_REPO_SLUG,
  [owner = null, repo = null] = slug ? slug.split('/') : [],
  pullRequest = getEnvInt('TRAVIS_PULL_REQUEST');

function assertContext() {
  if (!owner || !repo || pullRequest === null) {
    throw new Error('not running in a travis pull request');
  }
}

/**
 * Statically update the auth, to override the GITHUB_TOKEN environment variable (if defined).
 *
 * @param {?string} _auth The authentication string to use.
 */
export function setAuth(_auth) {
  auth = _auth;
  authChanged = true;
}

/**
 * Get a GitHub client.
 *
 * @param {?string} auth If provided (not undefined), used to create a new client.
 * @return {Octokit}
 * @throws {Error} If no auth provided and not running in a Travis pull request.
 */
export function getClient({ auth: _auth } = {}) {
  // Support non-static usage, for whatever reason.
  if (_auth !== undefined) {
    return new Octokit({ auth: _auth });
  }

  assertContext();
  if (authChanged || !client) {
    client = new Octokit({ auth });
    authChanged = false;
  }
  return client;
}

/**
 * Get the options to provide to most PR-related API calls.
 *
 * @param {?Object} extra Extra options to include in the returned object (optional).
 * @return {Object} The combined and environment-extracted options.
 * @throws {Error} If no auth provided and not running in a Travis pull request.
 */
export function getOptions(extra) {
  assertContext();
  return {
    owner,
    repo,
    issue_number: pullRequest,
    ...extra,
  };
}
