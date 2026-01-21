
import logger from './logger.js';
import axios from 'axios';
import xml2js from 'xml2js';
let parser = new xml2js.Parser();

type IsyInfo = {
	isy_https: number;
	isy_ip_address: any;
	isy_port: any;
	isy_username: any;
	isy_password: any;
};

export class ISY {
	isyInfo: IsyInfo;
	isyURL: string;
	constructor(isyInfo : IsyInfo) {
		this.isyInfo = isyInfo;

		if (this.isyInfo.isy_https === 1) {
			this.isyURL = `https://${this.isyInfo.isy_ip_address}:${this.isyInfo.isy_port}`;
		} else {
			this.isyURL = `http://${this.isyInfo.isy_ip_address}:${this.isyInfo.isy_port}`;
		}
	}

	_info() {
		logger.error(JSON.stringify(this.isyInfo));
	}

	async getInv(URL: string) {
		try {
			const response = await axios.default.get(URL, {
				auth: {
					username: this.isyInfo.isy_username,
					password: this.isyInfo.isy_password},
			});
			return response.data;
		} catch (error) {
			logger.error('getInv() Error: %s', URL);
		}
	}

	async runCmd(API: string) {
		let URL = '';
		if (API.startsWith('/')) {
			URL = this.isyURL + API;
		} else {
			URL = `${this.isyURL}/${API}`;
		}

		try {
			const response = await axios.default.get(URL, {
				auth: {
					username: this.isyInfo.isy_username,
					password: this.isyInfo.isy_password},
			});
			return response.data;
		} catch (error) {
			logger.error('runCmd() Error: %s', URL);
		}
	}

	async nodes(json = true) {
		let URL = this.isyURL + '/rest/nodes';
		let xmlNodes = '';
		let jsonNodes = '';

		try {
			xmlNodes = await this.getInv(URL);

			if (json) {
				parser.parseString(xmlNodes, function(err: any, result: string) {
					if (err) {
						logger.error('Parsing ISY Nodes XML Failed');
					} else {
						jsonNodes = result;
					}
				});
				return jsonNodes;
			} else {
				return xmlNodes;
			}
		} catch (error) {
			logger.error('isyNodes: ', error);
		}
	}

	async intVars(json = true) {
		let URL = this.isyURL + '/rest/vars/get/1';
		let xmlVars = '';
		let jsonVars = '';

		try {
			xmlVars = await this.getInv(URL);

			if (json) {
				parser.parseString(xmlVars, function(err: any, result: string) {
					if (err) {
						logger.error('Parsing Integer Vars XML Failed');
					} else {
						jsonVars = result;
					}
				});
				return jsonVars;
			} else {
				return xmlVars;
			}
		} catch (error) {
			logger.error('intVars: ', error);
		}
	}

	async stateVars(json = true) {
		let URL = this.isyURL + '/rest/vars/get/2';
		let xmlVars = '';
		let jsonVars = '';

		try {
			xmlVars = await this.getInv(URL);

			if (json) {
				parser.parseString(xmlVars, function(err: any, result: string) {
					if (err) {
						logger.error('Parsing State Vars XML Failed');
					} else {
						jsonVars = result;
					}
				});
				return jsonVars;
			} else {
				return xmlVars;
			}
		} catch (error) {
			logger.error('stateVars: ', error);
		}
	}

	async programs(json = true) {
		let URL = this.isyURL + '/rest/programs?subfolders=true';
		let xmlProgs = '';
		let jsonProgs = '';

		try {
			xmlProgs = await this.getInv(URL);

			if (json) {
				parser.parseString(xmlProgs, function(err: any, result: string) {
					if (err) {
						logger.error('Parsing ISY Programs XML Failed');
					} else {
						jsonProgs = result;
					}
				});
				return jsonProgs;
			} else {
				return xmlProgs;
			}
		} catch (error) {
			logger.error('programs: ', error);
		}
	}

	async netResources(json = true) {
		let URL = this.isyURL + '/rest/networking/resources';
		let xmlNetRes = '';
		let jsonNetRes = '';

		try {
			xmlNetRes = await this.getInv(URL);

			if (json) {
				parser.parseString(xmlNetRes, function(err: any, result: string) {
					if (err) {
						logger.error('Parsing ISY Network Resources XML Failed');
					} else {
						jsonNetRes = result;
					}
				});
				return jsonNetRes;
			} else {
				return xmlNetRes;
			}
		} catch (error) {
			logger.error('netResources: ', error);
		}
	}

};
