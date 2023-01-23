import { useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";

export default ({ afterSubmit }: { afterSubmit: () => void }) => {
  const formMethods = useForm<{ by: string; details: string }>();
  const newOrder = trpc.orders.new.useMutation();

  return (
    <>
      <p className="text-lg">New Request</p>
      <form
        onSubmit={formMethods.handleSubmit((data) => {
          newOrder
            .mutateAsync({
              ...data,
            })
            .then(() => {
              afterSubmit();
            });
        })}
      >
        <input
          type="text"
          {...formMethods.register("by", { required: true })}
          className="input input-sm"
          placeholder="by"
        ></input>
        <input
          type="text"
          {...formMethods.register("details", { required: true })}
          className="input input-sm"
          placeholder="details"
        ></input>
        <button type="submit" className="btn btn-xs">
          create
        </button>
      </form>
    </>
  );
};
