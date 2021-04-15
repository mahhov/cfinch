const ArgsListParser = require('args-list-parser');

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
		defaultValues: ['Default'],
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

module.exports = new ArgsListParser(argDescriptions).parse();
