export interface IResponse<T> {
  error: boolean;
  data?: T;
}
