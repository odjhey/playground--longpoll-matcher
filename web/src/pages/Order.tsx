import { trpc } from "../utils/trpc";

type TProps = {
  by: string;
  details: string;
  orderId: string;
};

export default (props: TProps) => {
  const find = trpc.orders.findMatch.useMutation();

  return (
    <>
      <pre>{JSON.stringify(props, null, 2)}</pre>

      <div className="flex">
        <p>{find.isLoading ? "loading " : ""}</p>
        <pre>{JSON.stringify(find.data)}</pre>
      </div>

      <button
        onClick={() => {
          find.mutateAsync({ orderId: props.orderId });
        }}
        className="btn btn-xs"
      >
        find match
      </button>
    </>
  );
};
