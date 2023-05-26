export interface TesterModel {
  collectionId: number;
  testId: number;
  assert: boolean;
  status?: number;
  body?: object | string;
}
