// Copied from colorChrome module because we're considering merging the 2 repos. Until then, keep this in sync.

const EventEmitter = require('events');

class Formatter extends EventEmitter {
	constructor() {
		super();

		this.COLORS = {
			normal: '\x1B[0;m',
			bold: '\x1b[1m',
			underline: '\x1b[4m',

			black: '\x1B[1;30m',
			red: '\x1B[1;31m',
			green: '\x1B[1;32m',
			yellow: '\x1B[1;33m',
			blue: '\x1B[1;34m',
			pink: '\x1B[1;35m',
			cyan: '\x1B[1;36m',
			white: '\x1B[1;37m',
			orange: '\x1B[1;38;5;208m',
			gray: '\x1B[1;38;5;246m',

			// lblack: '\x1B[1;90m',
			// lred: '\x1B[1;91m',
			// lgreen: '\x1B[1;92m',
			// lyellow: '\x1B[1;93m',
			// lblue: '\x1B[1;94m',
			// lpink: '\x1B[1;95m',
			// lcyan: '\x1B[1;96m',
			// lwhite: '\x1B[1;97m',

			iblack: '\x1B[1;40m',
			ired: '\x1B[1;41m',
			igreen: '\x1B[1;42m',
			iyellow: '\x1B[1;43m',
			iblue: '\x1B[1;44m',
			ipink: '\x1B[1;45m',
			icyan: '\x1B[1;46m',
			iwhite: '\x1B[1;47m\x1B[1;30m',
			iorange: '\x1B[1;48;5;208m',
			igray: '\x1B[1;48;5;246m',

			ilblack: '\x1B[1;100m',
			ilred: '\x1B[1;101m\x1B[1;30m',
			ilgreen: '\x1B[1;102m\x1B[1;30m',
			ilyellow: '\x1B[1;103m\x1B[1;30m',
			ilblue: '\x1B[1;104m\x1B[1;30m',
			ilpink: '\x1B[1;105m\x1B[1;30m',
			ilcyan: '\x1B[1;106m\x1B[1;30m',
			ilwhite: '\x1B[1;107m\x1B[1;30m',
		};

		this.BLOCKED_MESSAGES = [
			{regex: /^[/\w.]+\/gomacc .*$/, skip: 0},
			// {regex: /[\d\/:]*ERROR:compositing_layer_property_updater\.cc\(59\)]/, skip: 0},
			// {regex: /WARN: LogGLDebugMessage\(110\):/, skip: 5},
			// {regex: /ERROR:context_provider_command_buffer\.cc\(344\)\] Unexpected access to ContextGL\(\)/, skip: 0},
		];

		this.skip = 0;
		this.lastLineTime;
		this.startTime;
		this.urlsSeen = [];
		this.lineNumber = 0;
		this.incompleteLine = '';
	}

	onLine(line) {
		// filter BLOCKED_MESSAGES
		if (this.skip) {
			this.skip--;
			return;
		}
		let blocked = this.BLOCKED_MESSAGES.find(({regex}) => regex.test(line));
		if (blocked) {
			this.skip = blocked.skip;
			return;
		}

		// shorten unreadable errors
		// line = line.replace(/^\[\d+:\d+:\d+\/\d+\.\d+:/g, () => 'ERROR');
		// if (!line)
		// 	return;
		let errorRegex = Formatter.regexAnyWord(['failed', 'failure', 'error', 'received signal', 'crashed']);
		let hasError = line.match(errorRegex);
		line = line.replace(errorRegex, m => `${this.COLORS.red}${m}${this.COLORS.normal}`);

		let successRegex = Formatter.regexAnyWord(['passed  ] ', 'ok ] ']);
		let hasSuccess = line.match(successRegex);
		line = line.replace(successRegex, m => `${this.COLORS.green}${m}${this.COLORS.normal}`);

		// translate paths
		let fileRegex = /\.\.\/\.\.\/(\S*:)/g;
		let hasFile = line.match(fileRegex);
		line = line.replace(fileRegex, (_, file) => `src/${file}`)

		// line breaks if more than 1.5s between outputs
		let time = Date.now();
		if (time - this.lastLineTime > 1500 || hasError)
			this.emit('line', '');
		this.lastLineTime = time;

		// replace colors; e.g. `red print message`
		Object.entries(this.COLORS).forEach(([key, code]) =>
			line = line.replace(new RegExp(`^.*\\b${key}\\b.*$`, 'g'), line => `${code}${line}${this.COLORS.normal}`));

		// replace times; e.g. `print message [t 1253]`
		line = line.replace(/\[(tt?) (-?\d+)]/g, (_, tt, time) => {
			if (!this.startTime || tt === 'tt')
				this.startTime = Number(time);
			return `[${tt} ${this.startTime} + ${Number(time) - this.startTime}]`;
		});

		// URL nicknaming
		line = line.replace(/\[(https:[^\]]+)]/g, (_, url) => {
			if (!this.urlsSeen.includes[url])
				this.urlsSeen.push(url);
			let index = this.urlsSeen.indexOf(url);
			let urlChar = (Math.floor(index / 26) || '') + String.fromCharCode(65 + index % 26);
			return `[==${urlChar}== ${url}]`;
		});

		let lineNumberColor = hasError ? this.COLORS.ired : hasSuccess ? this.COLORS.igreen : this.COLORS.ilblack;
		let lineNumberStr = `${this.COLORS.normal}${lineNumberColor}${this.lineNumber}:${this.COLORS.normal}`;
		this.lineNumber++;

		this.emit('line', `${lineNumberStr}${hasFile ? '\n' : ' '}${line}`);
		if (hasError)
			this.emit('line', '');
	}

	onData(data) {
		let lines = (this.incompleteLine + data.toString()).split('\n');
		this.incompleteLine = lines.pop();
		lines.forEach(line => this.onLine(line));
	}

	onEnd() {
		this.onLine(this.incompleteLine);
	}

	static regexAnyWord(words) {
		return new RegExp(words.map(s => `\\b${s}\\b`).join('|'), 'i');
	}
}

module.exports = Formatter;
