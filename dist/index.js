'use strict';

var SentryCli = require('@sentry/cli');
var shelljs = require('shelljs');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var SentryCli__default = /*#__PURE__*/_interopDefaultLegacy(SentryCli);
var shelljs__default = /*#__PURE__*/_interopDefaultLegacy(shelljs);

function toArray(value) {
  if (Array.isArray(value) || value === null || value === void 0) {
    return value;
  }
  return [value];
}
function clearSourceMap(paths, ext) {
  if (Array.isArray(paths)) {
    try {
      paths.forEach((path$1) => {
        shelljs__default["default"].rm("-r", path.resolve(process.cwd(), `${path$1}/**/*${ext}`));
      });
    } catch (error) {
      throw new Error(`\u5220\u9664\u5931\u8D25:${error}`);
    }
  }
}

function sentry(options) {
  const sentryPlugin = {
    name: "sentry",
    closeBundle: async () => {
      options = Object.assign({}, { finalize: true, rewrite: true }, options);
      if (options.include) {
        options.include = toArray(options.include);
      }
      if (options.ignore)
        options.ignore = toArray(options.ignore);
      if (!options.include) {
        throw new Error(`\`include\` option is required`);
      }
      try {
        const cli = new SentryCli__default["default"](options.configFile, {
          silent: options.silent === true,
          org: options.org,
          project: options.project,
          authToken: options.authToken,
          url: options.url,
          vcsRemote: options.vcsRemote
        });
        const release = options.release ? options.release.trim() : await cli.releases.proposeVersion();
        await cli.releases.new(release);
        await cli.releases.uploadSourceMaps(release, options);
        const { commit, previousCommit, repo, auto, ignoreMissing, ignoreEmpty } = options.setCommits || {};
        if (auto || repo && commit) {
          await cli.releases.setCommits(release, {
            commit,
            previousCommit,
            repo,
            auto,
            ignoreMissing,
            ignoreEmpty
          });
        }
        if (options.finalize) {
          await cli.releases.finalize(release);
        }
        const { env, started, finished, time, name, url } = options.deploy || {};
        if (env) {
          await cli.releases.newDeploy(release, {
            env,
            started,
            finished,
            time,
            name,
            url
          });
        }
        if (options.cleanSourceMap) {
          clearSourceMap(options.include, ".js.map");
        }
      } catch (error) {
        throw new Error(`sentry\u6267\u884C\u5931\u8D25${error}`);
      }
    }
  };
  return sentryPlugin;
}

module.exports = sentry;
