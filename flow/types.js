declare type Options = {
	ssl: boolean;
	node: string;
	randomPeer: boolean;
	testnet: boolean;
	port: number;
	bannedPeers: Array<string>;
	nethash: string;
}

declare type NethashOption = {
	'Content-Type': string;
	nethash: string;
	broadhash: string;
	os: string;
	version: string;
	minVersion: string;
	port: number;
}

declare type NethashOptions = {
	mainnet: NethashOption;
	testnet: NethashOption;
}
