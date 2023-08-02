import { faker } from "@faker-js/faker";

export interface ProjectModel {
  name: string;
  config: ConfigModel;
  collections: CollectionModel[];
  fakers: FakerContainerModel[];
  uis: UiContainerModel[];
}

export interface ConfigModel {
  type: string;
  host: string;
  dbType: string;
  dbUrl: string;
  header: string;
  withCredentials: boolean;
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

export interface UiContainerModel {
  name: string;
  screenshots: boolean;
  data: UiTestModel[];
}

export interface UiTestModel {
  selector: string;
  input: string;
  event: string;
}

export const UiEvent = [
  "Nothing",
  "Wait",
  "LeftMouseClick",
  "RightMouseClick",
  "Enter",
  "Tab",
  "Space",
  "Backspace",
  "Esc",
  "PgDown",
  "PgUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
];

export interface AssertionModel {
  status: number;
  body: string;
}

export const FakerType = [
  { name: "uuid", gen: () => faker.string.uuid() },
  { name: "email", gen: () => faker.internet.email() },
  { name: "password", gen: () => faker.internet.password() },
  { name: "fullName", gen: () => faker.person.fullName() },
  { name: "userName", gen: () => faker.internet.userName() },
  { name: "avatar", gen: () => faker.internet.avatar() },
  { name: "color", gen: () => faker.color.rgb() },
  { name: "country", gen: () => faker.location.country() },
  { name: "lorem", gen: () => faker.lorem.sentence() },
  { name: "product", gen: () => faker.commerce.product() },
  { name: "price", gen: () => faker.commerce.price() },
  { name: "companyName", gen: () => faker.company.name() },
  { name: "boolean", gen: () => faker.datatype.boolean() },
  { name: "int", gen: () => faker.number.int() },
  { name: "age", gen: () => faker.number.int({ min: 1, max: 100 }) },
  { name: "float", gen: () => faker.number.float() },
  { name: "date", gen: () => faker.date.anytime() },
  { name: "gender", gen: () => faker.person.gender() },
  { name: "phone", gen: () => faker.phone.number() },
];
