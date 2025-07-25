const ArgsListParser = require('args-list-parser');
const childProcess = require('child_process');
const paths = require('../paths.json');
const Formatter = require('./Formatter');

ArgsListParser.bashColorConsole();

class Runner {
	run(argStrings = undefined) {
		let args = new ArgsListParser(this.argDescriptions).parse(argStrings);
		if (this.checkArgs(args))
			Runner.spawnHelper(this.runArgs(args), this.build(args), this.buildName(args), this.out(args));
	}

	get argDescriptions() {
		/* override */
	}

	checkArgs(args) {
		/* override */
	}

	runArgs(args) {
		/* override */
	}

	build(args) {
		/* override */
	}

	buildName(args) {
		/* override */
	}

	out(args) {
		/* override */
	}

	static spawnHelper(runArgs, build, buildName, out) {
		let buildCommand = build ? `${paths.ninja} -C ${out} ${buildName}` : '';
		let runCommand = [`${out}/${buildName}`, ...runArgs].join('\\\n  --');
		console.log('');
		console.green(new Date().toLocaleString());
		if (buildCommand)
			console.green(buildCommand);
		console.green(runCommand);
		console.log('');

		let command = [
			'set -o pipefail',
			`pushd ${paths.chromeSrc}`,
			buildCommand ? `unbuffer ${buildCommand}` : '',
			`unbuffer ${runCommand}`,
			'popd',
		].filter(a => a).join(' && ');

		let formatter = new Formatter();
		formatter.on('line', line => console.log(line));

		let spawned = childProcess.spawn(command, {shell: true});
		spawned.stdout.on('data', data => formatter.onData(data));
		spawned.stderr.on('data', data => formatter.onData(data));
		spawned.on('error', err => formatter.onLine('err', err));
	}
}

module.exports = Runner;
