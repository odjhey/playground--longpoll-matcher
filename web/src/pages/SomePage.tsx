import { trpc } from "../utils/trpc";

export default () => {
  const hello = trpc.api.hello.useQuery({ greeting: "yaho" });

  return (
    <>
      <h1>Some Page</h1>
      <pre>{JSON.stringify(hello.isLoading)}</pre>
      <pre>{JSON.stringify(hello.data)}</pre>
      <pre>{JSON.stringify(hello.error)}</pre>
    </>
  );
};
