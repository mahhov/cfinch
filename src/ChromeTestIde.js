const Runner = require('./Runner');

class ChromeTestIde extends Runner {
	get argDescriptions() {
		return [
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
				names: ['set', 's'],
				defaultValues: ['components_unittests'],
				values: 1,
				example: '-t components_unittests',
				explanation: 'overrides the default test set "components_unittest"',
			}, {
				names: ['filter', 'f'],
				values: 1,
				example: '-f MemoriesServiceTest.*',
				explanation: 'sets gtest_filter=filter',
			},
		];
	}

	checkArgs(args) {
		if (!args)
			return console.warn('Failed to get args.');
		return true;
	}

	runCommandArgs(args) {
		return ([`${args.out[0]}/${args.set[0]} --gtest_filter=${args.filter[0]}`]);
	}

	build(args) {
		return true;
	}

	out(args) {
		return args.out[0];
	}
}

module.exports = ChromeTestIde;

// todo test name arg
// todo allow tab-tab autocompletion to show help
