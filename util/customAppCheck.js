const {
  withAppDelegate,
  createRunOncePlugin,
} = require("@expo/config-plugins");

const RNFI_CONFIGURE = `[FIRApp configure];\n`;
const RNFI_CONFIGURE_WithDEBUGAPPCHECK = `[RNFBAppCheckModule sharedInstance];\n`;

const withCustomAppCheck = (config) => {
  return withAppDelegate(config, async (config) => {
      // Add import
      if (!config.modResults.contents.includes('#import "RNFBAppCheckModule.h"')) {
          config.modResults.contents = config.modResults.contents.replace(
              /#import "AppDelegate.h"/g,
              `#import "AppDelegate.h"\n#import "RNFBAppCheckModule.h"`,
          );
      }
      if (
          config.modResults.contents.includes(RNFI_CONFIGURE) && !config.modResults.contents.includes(RNFI_CONFIGURE_WithDEBUGAPPCHECK)
      ) {
          const block = RNFI_CONFIGURE_WithDEBUGAPPCHECK + RNFI_CONFIGURE;
          config.modResults.contents = config.modResults.contents.replace(
              RNFI_CONFIGURE,
              block
          );
      }

      return config;
  });
};

module.exports = createRunOncePlugin(withCustomAppCheck);