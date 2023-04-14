interface IExpectedError {
  code: string;
  expected: string;
  recieved: string;
  path: [number, string];
  message: string;
}
export const zodErrorFormatter = (payload: IExpectedError[]) => {
  const firstError = payload[0];
  const { path, expected, recieved } = firstError;
  return `Invalid payload supplied for ${path[1]}! Expected: ${expected} and received: ${recieved}`;
};
