import { trpc } from "../utils/trpc";
import NewOrderReqForm from "./NewOrderReqForm";
import { SymbolIcon, TrashIcon } from "@radix-ui/react-icons";
import Order from "./Order";

export default () => {
  const orders = trpc.orders.list.useQuery();
  const clearOrders = trpc.orders.clear.useMutation();
  const fulfill = trpc.orders.fulfill.useMutation();
  const commitments = trpc.orders.commitments.useQuery();
  const reset = trpc.orders.reset.useMutation();

  return (
    <>
      <h1>Orders Page</h1>
      <div className="flex">
        <div className="flex flex-col">
          <div className="p-1">
            <NewOrderReqForm
              afterSubmit={() => {
                orders.refetch();
              }}
            ></NewOrderReqForm>
          </div>
          <div className="p-1">
            <div className="flex gap-1 items-center">
              <p className="text-lg">Requests</p>
              <button
                onClick={() => {
                  orders.refetch();
                }}
                className="btn btn-xs"
              >
                <SymbolIcon></SymbolIcon>
              </button>
              <button
                onClick={() => {
                  clearOrders.mutateAsync().then(() => {
                    orders.refetch();
                  });
                }}
                className="btn btn-xs"
              >
                <TrashIcon></TrashIcon>
              </button>
              <button
                onClick={() => {
                  reset.mutateAsync().then(() => {
                    orders.refetch();
                    commitments.refetch();
                  });
                }}
                className="btn btn-xs"
              >
                reset
              </button>
            </div>

            <p>{orders.isLoading}</p>
            <>
              {orders.data &&
                Object.keys(orders.data).map((k) => {
                  return (
                    <Order key={k} orderId={k} {...orders.data[k]}></Order>
                  );
                })}
            </>
          </div>
        </div>
        <div className="flex flex-col p-2 border-solid border-2 border-gray-300">
          <p className="text-lg">Fulfiller (john cena)</p>
          {fulfill.isLoading}
          <pre>{JSON.stringify(fulfill.data)}</pre>
          <p>{fulfill.isLoading ? "loading" : "-"}</p>
          <div>
            <button
              onClick={() => {
                fulfill.mutateAsync({ name: "john cena" }).then(() => {
                  commitments.refetch();
                });
              }}
              className="btn btn-xs btn-accent"
            >
              match
            </button>
            <pre>{JSON.stringify(commitments.data, null, 2)}</pre>
          </div>
        </div>
      </div>
    </>
  );
};
