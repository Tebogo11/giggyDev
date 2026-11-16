/** npm run can export allow-scripts into the child environment. npm 11 rejects
 * that CLI/env override for project installs, even with --ignore-scripts.
 * Drop the permission override only for these script-disabled fixture installs. */
export function consumerInstall(packageFile, inherited = process.env) {
  const env = {...inherited};
  for (const key of Object.keys(env)) {
    if (/^npm_config_(?:allow|ignore)[_-]scripts$/i.test(key)) delete env[key];
  }
  env.npm_config_ignore_scripts = 'true';
  return {
    args: ['install', ...(packageFile ? [packageFile] : []), '--ignore-scripts', '--no-audit', '--no-fund'],
    env,
  };
}
