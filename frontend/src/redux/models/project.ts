export interface ProjectModel {
  name: string;
  config: ConfigModel;
  collections: CollectionModel[];
}

export interface ConfigModel {
  host: string;
  dbType: string;
  dbUrl: string;
}

export interface CollectionModel {
  name: string;
  tests: TestModel[];
}

type TestModel = ApiModel | DbModel;

export interface ApiModel {
  name: string;
  methodType: string;
  endpoint: string;
  body: string;
  assertion: AssertionModel;
}

export interface DbModel {
  name: string;
  query: string;
}

export interface AssertionModel {
  status: number;
  body: string;
}
