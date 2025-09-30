import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";

export default function DropdownAction({
  menu,
}: {
  menu: {
    label: string | ReactNode;
    variant?: "destructive" | "default";
    action?: () => void;
    type?: "item" | "link";
  }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-muted-foreground size-8"
          size="icon"
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {menu.map((item, index) => (
          <DropdownMenuItem
            key={`dropdown-action-${index}`}
            variant={item.variant || "default"}
            asChild={item.type === "link"}
            onClick={item.action}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
