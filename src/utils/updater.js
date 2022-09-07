/** Модуль автообновления по wi-fi */

const https = require('https');
const { IS_RPI: isPi } = require('../constants');
const {
  version,
  repository,
  name: packageName,
} = require('../../package.json');
const { exec } = require('child_process');
const { ipcMain } = require('electron');
const { URL } = require('url');

const winGetBranch = 'git branch --show-current';
const linuxGetBranch = 'cd ~/booster-ui && git rev-parse --abbrev-ref HEAD';

function httpsGet(options) {
  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        if (res.statusCode !== 200)
          reject(new Error('Request Failed.\n' + `Status Code: ${statusCode}`));

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(rawData));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function getBranchName() {
  return new Promise((resolve, reject) => {
    exec(isPi ? linuxGetBranch : winGetBranch, (err, stdout) => {
      if (err) reject(err);
      resolve(stdout.trim());
    });
  });
}

module.exports = async function checkVersions() {
  try {
    const repoName = new URL(repository.url).pathname;
    const branch = await getBranchName();
    const remotePackageInfo = await httpsGet({
      hostname: 'raw.githubusercontent.com',
      port: 443,
      path: `${repoName}/${branch}/package.json`,
    });
    return remotePackageInfo.version !== version;
  } catch (e) {
    console.error(e.message);
  }
};

ipcMain.on('updateProgramm', () => {
  exec(`/home/pi/${packageName}/scripts/update`);
});
