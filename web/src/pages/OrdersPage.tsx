import { trpc } from "../utils/trpc";
import NewOrderReqForm from "./NewOrderReqForm";
import { SymbolIcon, TrashIcon } from "@radix-ui/react-icons";
import Order from "./Order";

export default () => {
  const orders = trpc.orders.list.useQuery();
  const clearOrders = trpc.orders.clear.useMutation();

  return (
    <>
      <h1>Orders Page</h1>
      <div className="flex">
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
          </div>

          <p>{orders.isLoading}</p>
          <>
            {orders.data &&
              Object.keys(orders.data).map((k) => {
                return <Order key={k} orderId={k} {...orders.data[k]}></Order>;
              })}
          </>
        </div>
        <div className="p-1">
          <NewOrderReqForm
            afterSubmit={() => {
              orders.refetch();
            }}
          ></NewOrderReqForm>
        </div>
      </div>
    </>
  );
};
