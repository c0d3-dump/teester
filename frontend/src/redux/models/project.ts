export interface ProjectModel {
  name: string;
  config: null | ConfigModel;
  collections: CollectionModel[];
}

export interface ConfigModel {
  host: string;
  dbType: DBType;
  dbUrl: string;
}

export enum DBType {
  SQLITE,
  MYSQL,
  POSTGRES,
}

export interface CollectionModel {
  name: string;
  tests: TestModel[];
}

type TestModel = ApiModel | DbModel;

export interface ApiModel {
  name: string;
  methodType: MethodType;
  endpoint: string;
  assertion: AssertionModel;
}

export enum MethodType {
  GET,
  POST,
  PUT,
  DELETE,
}

export interface DbModel {
  name: string;
  query: string;
  exec: boolean;
}

export interface AssertionModel {
  status: comparators;
  data: comparators[];
}

type comparators = Eq | Ne | In | Nin;

export interface Eq {
  cmp1: number | string | object;
  cmp2: number | string | object;
}
export interface Ne {
  cmp1: number | string | object;
  cmp2: number | string | object;
}
export interface In {
  cmp1: number[] | string[];
  cmp2: number[] | string[];
}
export interface Nin {
  cmp1: number[] | string[];
  cmp2: number[] | string[];
}
