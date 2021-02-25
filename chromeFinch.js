#!/usr/bin/env node

const childProcess = require('child_process');
const ArgsListParser = require('args-list-parser');

const CHROME_DIR = '~/workspace/chromium/src';
const NINJA_COMMAND = '~/workspace/depot_tools/ninja -j 1000 chrome -C';
const BUILD_OUTPUT_PIPE = '/usr/local/google/home/manukh/personal/colorChrome/translatePaths.js';
const CHROME_OUTPUT_PIPE = '/usr/local/google/home/manukh/personal/colorChrome/translateRunColors.js';

const argDescriptions = [
	{
		names: ['out', 'o'],
		defaultValues: ['out/Default'],
		values: 1,
		example: '-o out/Default',
		explanation: 'overrides the default build dir "out/Default"'
	}, {
		names: ['build', 'b'],
		values: 0,
		example: '-b',
		explanation: 'rebuilds.'
	}, {
		names: ['channel', 'c'],
		values: 1,
		example: '-c beta',
		explanation: 'sets fake-variations-channel=beta and variations-server-url=http://localhost:8080/seed'
	}, {
		names: ['dogfood', 'd'],
		values: 0,
		example: '-d',
		explanation: 'sets variations-server-url=http://localhost:8080/seed?restrict=dogfood'
	}, {
		names: ['study', 's'],
		defaultValues: ['OmniboxBundledExperimentV1'],
		values: 1,
		example: '-s OmniboxBundledExperimentV1',
		explanation: 'overrides the default study "OmniboxBundledExperimentV1" used below'
	}, {
		names: ['group', 'g'],
		values: 1,
		example: '-g Dev_Desktop_OmniboxDocumentMinCharacters_Control_V2',
		explanation: 'sets force-fieldtrials=study/group'
	}, {
		names: ['feature', 'f'],
		values: 2,
		example: '-f OmniboxLocalEntitySuggestions ...',
		explanation: 'sets enable-features="OmniboxLocalEntitySuggestions,...<study'
	}, {
		names: ['param', 'p'],
		values: 2,
		example: '-p UIMaxAutocompleteMatches 8 OmniboxMaxURLMatches 4 ...',
		explanation: 'sets force-fieldtrial-params=study.group:UIMaxAutocompleteMatches/8/OmniboxMaxURLMatches/4/...'
	}, {
		names: ['gwsid', 'gi'],
		values: 2,
		example: '-gi t3315884 3314219 ...',
		explanation: 'sets force-variation-ids="t3315884,3314219,..."'
	}, {
		names: ['google', 'gbu'],
		values: 1,
		example: '-gbu https://manukh-4.demos.corp.google.com/',
		explanation: 'sets google-base-url=https://manukh-4.demos.corp.google.com/'
	},
];

ArgsListParser.bashColorConsole();
let args = new ArgsListParser(argDescriptions).parse();
if (!args)
	return;

if (args.param && (!args.study || !args.group || !args.feature))
	console.warn("Specifying a 'param' argument usually requires also specifying the 'study', 'group', and 'feature' arguments.");

if (args.group && !args.channel)
	console.warn("Specifying a 'group' argument usually requires also specifying the 'channel' argument.");

// Create command
let commandArgs = [`${args.out}/chrome`];
if (args.channel)
	commandArgs.push(`fake-variations-channel=${args.channel[0]}`);
if (args.dogfood)
	commandArgs.push('variations-server-url=http://localhost:8080/seed?restrict=dogfood');
else if (args.channel)
	commandArgs.push('variations-server-url=http://localhost:8080/seed');
if (args.group)
	commandArgs.push(`force-fieldtrials=${args.study[0]}/${args.group[0]}`);
if (args.feature)
	commandArgs.push(`enable-features='${args.feature.map(feature => `${feature}<${args.study[0]}`).join(',')}'`);
if (args.param)
	commandArgs.push(`force-fieldtrial-params=${args.study[0]}.${(args.group || [''])[0]}:${args.param.join('/')}`);
if (args.gwsid)
	commandArgs.push(`force-variation-ids='${args.gwsid.join(',')}'`);
if (args.google)
	commandArgs.push(`google-base-url=${args.google[0]}`);

let chromeCommand = commandArgs.join('\\\n  --');
console.white(`\n${chromeCommand}\n`);

let pipedCommand = (command, outputPipe) => `unbuffer ${command} | node ${outputPipe} &&`;
let pipedBuildCommand = args.build ? pipedCommand(`NINJA_COMMAND ${args.out}`, BUILD_OUTPUT_PIPE) : '';
let pipedChromeCommand = pipedCommand(chromeCommand, CHROME_OUTPUT_PIPE);
let command = `set -o pipefail && pushd ${CHROME_DIR} && ${pipedBuildCommand} ${pipedChromeCommand} popd`;

let spawnedData = data => data.toString().trim();
let spawned = childProcess.spawn(command, {shell: true});
spawned.stdout.on('data', data => console.log(spawnedData(data)));
spawned.stderr.on('data', data => console.error(spawnedData(data)));
spawned.on('error', err => console.error('err', err));
