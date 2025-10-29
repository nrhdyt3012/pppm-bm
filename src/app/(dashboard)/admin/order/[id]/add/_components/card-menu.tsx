import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function CardMenu({
  menu,
  onAddToCart,
}: {
  menu: Menu;
  onAddToCart: (menu: Menu, action: "increment" | "decrement") => void;
}) {
  return (
    <Card
      key={menu.id}
      className="w-full border shadow-sm p-0 gap-0 flex flex-col justify-between"
    >
      <CardContent className="p-0">
        <Image
          src={`${menu.image_url}`}
          alt={menu.name}
          width={400}
          height={400}
          className="w-full object-cover rounded-t-lg"
        />
        <div className="px-4 py-2">
          <h3 className="text-lg font-semibold">{menu.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {menu.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div>
          {menu.discount > 0 && (
            <div className="text-sm line-through text-muted-foreground">
              {convertIDR(menu.price)}
            </div>
          )}
          <div className="text-xl font-bold">
            {menu.discount > 0
              ? convertIDR(menu.price - menu.price * (menu.discount / 100))
              : convertIDR(menu.price)}
          </div>
        </div>

        <Button
          className="cursor-pointer"
          onClick={() => onAddToCart(menu, "increment")}
        >
          <ShoppingCart />
        </Button>
      </CardFooter>
    </Card>
  );
}
