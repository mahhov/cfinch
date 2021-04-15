#!/usr/bin/env node

const childProcess = require('child_process');
const ArgsListParser = require('args-list-parser');
const paths = require('../paths.json');
const Formatter = require('./colorChrome/Formatter');
const args = require('./args');

ArgsListParser.bashColorConsole();

// Check args
if (!args) return;
if (args.param && (!args.study || !args.group || !args.feature))
	console.warn("Specifying a 'param' argument usually requires also specifying the 'study', 'group', and 'feature' arguments.");
if (args.group && !args.channel && !args.feature)
	console.warn("specifying a 'group' argument usually requires also specifying the 'channel' argument.");

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

let command = [
	'set -o pipefail',
	`pushd ${paths.chromeSrc}`,
	args.build ? `unbuffer ${paths.ninja} -j 1000 chrome -C ${args.out}` : '',
	`unbuffer ${chromeCommand}`,
	'popd',
].filter(a => a).join(' && ');

// Setup formatter
let formatter = new Formatter();
formatter.on('line', line => console.log(line));

// Run
let spawned = childProcess.spawn(command, {shell: true});
spawned.stdout.on('data', data => formatter.onData(data));
spawned.stderr.on('data', data => formatter.onData(data));
spawned.on('error', err => formatter.onLine('err', err));
