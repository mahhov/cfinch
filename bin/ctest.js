#!/usr/bin/env node

const ChromeTest = require('../src/ChromeTest');

new ChromeTest().run();

// Translates
//   ctest -f MemoriesServiceTest.*
// to
//   out/Default/components_unittests --gtest_filter=MemoriesServiceTest.*
