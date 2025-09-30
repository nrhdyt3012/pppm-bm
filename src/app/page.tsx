import { DarkmodeToggle } from "@/components/common/darkmode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-muted flex justify-center items-center h-screen flex-col space-y-4">
      <h1 className="text-4xl font-semibold">Welcome Avip Syaifulloh</h1>
      <Link href="/admin">
        <Button className="bg-teal-500 text-white">Access Dashboard</Button>
      </Link>
    </div>
  );
}
