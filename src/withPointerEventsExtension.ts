import { type ConfigPlugin, withMainApplication, withAppDelegate, withPlugins } from '@expo/config-plugins';

export const withDispatchPointerEventsAndroid: ConfigPlugin = config => {
  return withMainApplication(config, cfg => {
    const contents = cfg.modResults.contents;
    const lines = contents.split('\n');

    const importIndex = lines.findIndex(line => /^import com.facebook.soloader.SoLoader/.test(line));

    const loaderIndex = lines.findIndex(line => /SoLoader\.init\(this, OpenSourceMergedSoMapping\)/.test(line));

    // The property might be named differently in the new API
    // Let's try to directly access the registry for setting this feature flag
    cfg.modResults.contents = [
      ...lines.slice(0, importIndex + 1),
      'import com.facebook.react.config.ReactFeatureFlags;',
      ...lines.slice(importIndex + 1, loaderIndex + 1),
      '    ReactFeatureFlags.dispatchPointerEvents = true;',
      ...lines.slice(loaderIndex + 1),
    ].join('\n');

    return cfg;
  });
};

export const withDispatchPointerEventsIOS: ConfigPlugin = config => {
  return withAppDelegate(config, cfg => {
    const contents = cfg.modResults.contents;
    const lines = contents.split('\n');
    const delegateIndex = lines.findIndex(line =>
      /delegate.dependencyProvider = RCTAppDependencyProvider()/.test(line)
    );

    cfg.modResults.contents = [
      ...lines.slice(0, delegateIndex + 1),
      '    RCTSetDispatchW3CPointerEvents(true)',
      ...lines.slice(delegateIndex + 1),
    ].join('\n');

    return cfg;
  });
};

const withEnablePointerEvents: ConfigPlugin = config => {
  return withPlugins(config, [withDispatchPointerEventsAndroid, withDispatchPointerEventsIOS]);
};

export default withEnablePointerEvents;
