#!/usr/bin/env node

const ChromeFinch = require('../src/ChromeFinch');

new ChromeFinch().run();

// Translates
//   cfinch -f myFeature -p myParamName myParamValue
// to
//   out/Default/chrome\
//     --force-fieldtrials=OmniboxBundledExperimentV1/Default\
//     --enable-features='myFeature<OmniboxBundledExperimentV1'\
//     --force-fieldtrial-params=OmniboxBundledExperimentV1.Default:myParamName/myParamValue

//Translates
//   cfinch -c stable -s myFinchStudy -g myFinchGroup
// to
//   out/Default/chrome\
//     --fake-variations-channel=stable\
//     --variations-server-url=http://localhost:8080/seed\
//     --force-fieldtrials=myFinchStudy/myFinchGroup
