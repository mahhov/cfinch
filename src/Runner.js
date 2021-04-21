const ArgsListParser = require('args-list-parser');
const childProcess = require('child_process');
const paths = require('../paths.json');
const Formatter = require('./Formatter');

ArgsListParser.bashColorConsole();

class Runner {
	run(argStrings = undefined) {
		let args = new ArgsListParser(this.argDescriptions).parse(argStrings);
		if (this.checkArgs(args))
			Runner.spawnHelper(this.runCommandArgs(args), this.build(args), this.out(args));
	}

	get argDescriptions() {
		/* override */
	}

	checkArgs(args) {
		/* override */
	}

	runCommandArgs(args) {
		/* override */
	}

	build(args) {
		/* override */
		return args.build;
	}

	out(args) {
		/* override */
		return args.out[0];
	}

	static spawnHelper(runCommandArgs, build, out) {
		let runCommand = runCommandArgs.join('\\\n  --');
		console.log('');
		console.green(new Date().toLocaleString());
		console.green(runCommand);
		console.log('');

		let command = [
			'set -o pipefail',
			`pushd ${paths.chromeSrc}`,
			build ? `unbuffer ${paths.ninja} -j 1000 chrome -C ${out}` : '',
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
