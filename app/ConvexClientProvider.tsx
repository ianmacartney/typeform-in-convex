"use client";
import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({
                                               children,
                                             }: {
  children: ReactNode;
}) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}