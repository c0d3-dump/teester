export interface TestModal {
  requestType: string | undefined;
  url: string | undefined;
  assertionCode: number | undefined;
  dbName: string | undefined;
}

export interface CollectionModal {
  name: string;
  tests: TestModal[];
}

export interface GroupModal {
  name: string;
  collections: CollectionModal[];
}
