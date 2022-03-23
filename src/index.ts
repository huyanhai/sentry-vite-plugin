/* eslint-disable no-unused-vars */
import type { Plugin } from "vite";
import type { TSentryOptions } from "./type";
import SentryCli from "@sentry/cli";

import { toArray, clearSourceMap } from "./utils";

export default (options: TSentryOptions): Plugin => {
  const sentryPlugin: Plugin = {
    name: "sentry",
    closeBundle: async () => {
      options = Object.assign({}, { finalize: true, rewrite: true }, options);
      if (options.include) {
        options.include = toArray(options.include);
      }

      if (options.ignore) options.ignore = toArray(options.ignore);

      if (!options.include) {
        throw new Error(`\`include\` option is required`);
      }
      try {
        const cli = new SentryCli(options.configFile, {
          silent: options.silent === true,
          org: options.org,
          project: options.project,
          authToken: options.authToken,
          url: options.url,
          vcsRemote: options.vcsRemote,
        });

        const release = options.release ? options.release.trim() : await cli.releases.proposeVersion();

        await cli.releases.new(release);
        await cli.releases.uploadSourceMaps(release, options as any);
        const { commit, previousCommit, repo, auto, ignoreMissing, ignoreEmpty } = options.setCommits || {};
        if (auto || (repo && commit)) {
          await cli.releases.setCommits(release, {
            commit,
            previousCommit,
            repo,
            auto,
            ignoreMissing,
            ignoreEmpty,
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
            url,
          });
        }
        if (options.cleanSourceMap) {
          clearSourceMap(options.include, ".js.map");
        }
      } catch (error) {
        throw new Error(`sentry执行失败${error}`);
      }
    },
  };
  return sentryPlugin;
};
