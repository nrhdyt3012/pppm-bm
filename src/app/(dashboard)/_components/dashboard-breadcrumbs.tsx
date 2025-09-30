"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").slice(1);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => (
          <Fragment key={`path-${path}`}>
            <BreadcrumbItem className="capitalize">
              {index < paths.length - 1 ? (
                <BreadcrumbLink
                  href={`/${paths.slice(0, index + 1).join("/")}`}
                >
                  {path}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{path}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < paths.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
