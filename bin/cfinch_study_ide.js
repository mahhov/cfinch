#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const ChromeFinch = require('../src/ChromeFinch');

let asyncWrapper = async () => {
	// E.g. <...>.gcl
	let studyPath = process.argv[2];
	// E.g. Dev_Desktop_OmniboxEntityLatency_SharedDecoder_V2
	let groupName = process.argv[3];

	if (!studyPath || !groupName)
		return console.warn('Missing inputs', studyPath, groupName);

	let studyText = (await fs.readFile(path.resolve(studyPath))).toString();
	let studyName = studyText.match(/Study study = {\s*name = '(\w+)'/)?.[1];
	let channel = groupName.match(/dev|beta|stable/i)?.[0].toLowerCase() || 'stable';

	new ChromeFinch().run([
		'-c', channel,
		...(studyName ? ['-s', studyName] : []),
		'-g', groupName,
	]);
};

asyncWrapper();

// Translates
//   cfinch_study_ide <...>.gcl Dev_Desktop_OmniboxEntityLatency_SharedDecoder_V2
// to
//   out/Default/chrome\
//     --fake-variations-channel=dev\
//     --variations-server-url=http://localhost:8080/seed\
//     --force-fieldtrials=<study_name>/Dev_Desktop_OmniboxEntityLatency_SharedDecoder_V2

// To use with idea IDEs, configure an 'external tool' with:
//   Program:   <...>/node/<version>/bin/node
//   Arguments: <...>/chromeFinch/bin/cfinch_study_ide $FilePath$ $SelectedText$
