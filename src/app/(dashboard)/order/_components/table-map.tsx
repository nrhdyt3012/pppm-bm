import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { TableMapType } from "@/validations/table-validation";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Background, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import DialogCreateOrderDineIn from "./dialog-create-order-dine-in";

export function TableNode({
  data,
}: {
  data: {
    id: string;
    label: string;
    capacity: number;
    status: string;
    order?: {
      id: string;
      order_id: string;
      customer_name: string;
    };
    handleReservation: (id: string, table_id: string, status: string) => void;
  };
}) {
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "bg-muted rounded-lg flex items-center justify-center outline-2 outline-offset-4 outline-dashed",
            {
              "w-20 h-20": data.capacity === 2,
              "w-32 h-20": data.capacity === 4,
              "w-38 h-20": data.capacity === 6,
              "w-48 h-20": data.capacity === 8,
              "w-64 h-20": data.capacity === 10,
            },
            {
              "outline-amber-600": data.status === "reserved",
              "outline-green-600": data.status === "available",
              "outline-blue-600": data.status === "unavailable",
            }
          )}
        >
          {data.label}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="mt-2">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Table {data.label}</h4>
          <p className="text-xs text-muted-foreground">
            Capacity: {data.capacity}
          </p>
          <p className="text-xs text-muted-foreground">Status: {data.status}</p>
          {data.order ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Order ID : {data.order.order_id}
              </p>
              <p className="text-xs text-muted-foreground">
                Customer : {data.order.customer_name}
              </p>
              {data.status === "unavailable" ? (
                <Link
                  className="mt-2 w-full"
                  href={`/order/${data.order.order_id}`}
                >
                  <Button>View Detail Order</Button>
                </Link>
              ) : (
                <div className="w-full flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() =>
                      data.handleReservation(
                        `${data?.order?.id}`,
                        data.id,
                        "canceled"
                      )
                    }
                  >
                    Canceled
                  </Button>
                  <Button
                    onClick={() =>
                      data.handleReservation(
                        `${data?.order?.id}`,
                        data.id,
                        "process"
                      )
                    }
                  >
                    Process
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Dialog open={openCreateOrder} onOpenChange={setOpenCreateOrder}>
              <DialogTrigger asChild>
                <Button>Create Order</Button>
              </DialogTrigger>
              <DialogCreateOrderDineIn
                closeDialog={() => setOpenCreateOrder(false)}
                selectedTable={{
                  id: data.id,
                  name: data.label,
                }}
              />
            </Dialog>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function TableMap({
  tables,
  activeOrders,
  handleReservation,
}: {
  tables: TableMapType[];
  activeOrders: {
    order_id: string;
    customer_name: string;
    tables: unknown;
  }[];
  handleReservation: (id: string, table_id: string, status: string) => void;
}) {
  const nodeTypes = {
    tableNode: TableNode,
  };

  const initialNodes = useMemo(() => {
    return tables.map((table) => ({
      id: table.id,
      position: { x: table.position_x, y: table.position_y },
      data: {
        id: table.id,
        label: table.name,
        capacity: table.capacity,
        status: table.status,
        order: activeOrders.find((order) => {
          return (order.tables as unknown as { id: string })?.id === table.id;
        }),
        handleReservation,
      },
      type: "tableNode",
    }));
  }, [tables]);

  return (
    <div className="w-[100%] h-[80vh] border rounded-lg">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodes={initialNodes}
        nodeTypes={nodeTypes}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
