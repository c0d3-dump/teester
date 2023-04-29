import axios, { type AxiosRequestConfig } from 'axios';
import util from 'util';

enum RequestType {
	GET,
	POST,
	DELETE
}

type Header = object;
type Query = object;
type Body = object;

type Code = number;
type Result = object;

const request = async (
	requestType: RequestType,
	url: string,
	headers: Header,
	query: Query,
	body: Body
) => {
	switch (requestType) {
		case RequestType.GET:
			return await get(url, headers, query);
		default:
			break;
	}
};

const get = async (url: string, headers: Header, query: Query) => {
	const config: AxiosRequestConfig = {
		headers: headers,
		params: query
	};

	return axios.get(url, config);
};

const expects = (response: object, expected: object) => {
	if (util.isDeepStrictEqual(response, expected)) {
		return true;
	}
	return false;
};

const clearCookie = () => {
	// TODO: clear cookie
	// document.cookie
};

export { RequestType, request, expects, clearCookie };
