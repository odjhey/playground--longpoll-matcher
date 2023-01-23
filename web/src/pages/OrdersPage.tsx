import { trpc } from "../utils/trpc";
import NewOrderReqForm from "./NewOrderReqForm";
import { SymbolIcon } from "@radix-ui/react-icons";

export default () => {
  const orders = trpc.orders.list.useQuery();

  return (
    <>
      <h1>Orders Page</h1>
      <div className="flex">
        <div className="p-1">
          <div className="flex gap-1 items-center">
            <p className="text-lg">Requests</p>
            <button className="btn btn-xs">
              <SymbolIcon
                onClick={() => {
                  orders.refetch();
                }}
              ></SymbolIcon>
            </button>
          </div>

          <p>{orders.isLoading}</p>
          <pre>{JSON.stringify(orders.data, null, 2)}</pre>
        </div>
        <div className="p-1">
          <NewOrderReqForm></NewOrderReqForm>
        </div>
      </div>
    </>
  );
};
