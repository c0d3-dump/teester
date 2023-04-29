const getData = (): CollectionType[] => [
	{
		title: 'collection-1',
		groups: [
			{
				lead: 'grp-1',
				summary: '',
				tests: [
					{ requestType: 'GET', url: '/profile' },
					{ requestType: 'POST', url: '/login' },
					{ requestType: 'GET', url: '/profile' }
				]
			},
			{
				lead: 'grp-2',
				summary: '',
				tests: [
					{ requestType: 'GET', url: '/profile' },
					{ requestType: 'POST', url: '/login' },
					{ requestType: 'GET', url: '/profile' }
				]
			}
		]
	},
	{
		title: 'collection-2',
		groups: []
	}
];

export { getData };
