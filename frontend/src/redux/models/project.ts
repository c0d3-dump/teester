export interface ProjectModel {
  name: string;
  config: ConfigModel;
  collections: CollectionModel[];
  fakers: FakerContainerModel[];
}

export interface ConfigModel {
  host: string;
  dbType: string;
  dbUrl: string;
  header: string;
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
  header: string;
  body: string;
  assertion: AssertionModel;
}

export interface DbModel {
  name: string;
  query: string;
}

export interface FakerContainerModel {
  name: string;
  data: FakerModel[];
}

export interface FakerModel {
  fieldName: string;
  type: string;
  constraints: string;
}

export const FakerType = ["email", "name", "uuid"];

export interface AssertionModel {
  status: number;
  body: string;
}
