#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const ChromeTest = require('../src/ChromeTest');

let asyncWrapper = async () => {
	// E.g. out/Default
	let out = process.argv[2];
	// E.g. <...>/src/components/omnibox/browser/document_provider_unittest.cc
	let testFilePath = process.argv[3];

	let cachePath = path.resolve(__dirname, '_cached_ctest_ide_inputs.txt');
	if (testFilePath && testFilePath.match(/test\.cc$/))
		fs.writeFile(cachePath, testFilePath);
	else {
		testFilePath = (await fs.readFile(cachePath).catch(() => '')).toString();
		if (!testFilePath)
			return console.warn('Missing testFilePath.');
	}

	let testSet;
	if (testFilePath.includes('/chromium/src/components/'))
		testSet = 'components_unittests';
	else if (testFilePath.includes('/chromium/src/ui/views/'))
		testSet = 'views_unittests ';
	else
		testSet = 'unit_tests';

	let testFileContent = (await fs.readFile(testFilePath)).toString();
	let testName = [...testFileContent.matchAll(/TEST(?:_F)?\(\s*(\w+),/g)]
		.map(m => m[1])
		.filter((v, i, a) => a.indexOf(v) === i)
		.map(testName => `${testName}.*`)
		.join(':');
	if (!testName)
		return console.warn('Missing testName.');

	new ChromeTest().run([
		'-b',
		'-o', out,
		'-s', testSet,
		'-f', `${testName}.*`,
	]);
};

asyncWrapper();

// Translates
//   ctest_ide out/Default <...>/src/components/omnibox/browser/document_provider_unittest.cc
// to
//   out/Default/components_unittests --gtest_filter=DocumentProviderTest.*
