/* eslint-disable @typescript-eslint/no-unused-vars */

type CollectionType = {
	title: string;
	groups: GroupItemType[];
};

type GroupItemType = {
	lead: string;
	summary: string;
	tests: TestItemType[];
};

type TestItemType = {
	requestType: string;
	url: string;
};
