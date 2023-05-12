#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const ChromeTest = require('../src/ChromeTest');

const cachePath = path.resolve(__dirname, '_cached_ctest_ide_inputs.txt');

let readCachedTestFilePathAndFilterName = async () => {
	let read = (await fs.readFile(cachePath).catch(() => '')).toString()?.split('\n');
  if (read?.length === 2)
    return read;
  console.warn('Missing testFilePath.');
	return ['', '*'];
};

let writeCachedTestFilePathAndFilterName = (testFilePath, filterName) =>
	fs.writeFile(cachePath, [testFilePath, filterName].join('\n'));

let getTestSet = testFilePath => {
  if (testFilePath.includes('/chromium/src/components/'))
    return 'components_unittests';
  if (testFilePath.includes('/chromium/src/ui/views/'))
    return 'views_unittests';
  if (testFilePath.includes('browsertest.cc'))
    return 'browser_tests';
  return 'unit_tests';
};

let getFilterName = async testFilePath => {
  let fileContent = (await fs.readFile(testFilePath)).toString();
  let filterName = [...fileContent.matchAll(
      /TEST(?:_F|_P|)\(\s*(\w+),/g)]
      .map(m => m[1])
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(testName => `*${testName}.*`)
      .join(':');
  if (filterName)
    return filterName;
  console.warn('Missing filterName.');
  return '*';
}

let asyncWrapper = async () => {
	// E.g. out/Default
	let out = process.argv[2];
	// E.g. <...>/src/components/omnibox/browser/document_provider_unittest.cc
	let testFilePath = process.argv[3];
	// E.g. AutocompleteResultTest, 0, or undfeined
	let filterSeed = process.argv[4];

  // if inTestFile
  //  and filterSeed = 0         -> autogenerate
  //  and filterSeed = undefined -> read cached
  //  and filterSeed set         -> use

  // if !inTestFile
  //  and filterSeed = 0              -> autogenerate
  //  and filterSeed undefined or set -> read cached

  let isTestFile = testFilePath.match(/test\.cc$/);
  // E.g., *AutocompleteResultTest.*
  let filterName;
	if (!isTestFile)
    [testFilePath, filterName] = await readCachedTestFilePathAndFilterName();
  else if (!filterSeed)
    filterName = (await readCachedTestFilePathAndFilterName())[1];

  if (filterSeed === '0')
    filterName = await getFilterName(testFilePath);
  else if (isTestFile && filterSeed)
    filterName = `*${filterSeed}*`;

  if (isTestFile || filterSeed === '0')
    writeCachedTestFilePathAndFilterName(testFilePath, filterName);

	new ChromeTest().run([
		'-b',
		'-o', out,
		'-s', getTestSet(testFilePath),
		'-f', filterName,
	]);
};

asyncWrapper();

// Translates
//   ctest_ide out/Default <...>/src/components/omnibox/browser/document_provider_unittest.cc 0
// to
//   out/Default/components_unittests --gtest_filter=DocumentProviderTest.*

// 1st arg is out dir.
// 2nd arg is test file path. If not a test file, read from cache.
// 3rd arg is optional filgetName. If omitted, read from cache. If '0', autogenerates from file.
