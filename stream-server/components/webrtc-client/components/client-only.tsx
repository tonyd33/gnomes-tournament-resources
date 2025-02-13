"use client";
import dynamic from "next/dynamic";
import { FunctionComponent, PropsWithChildren } from "react";

/** Simple wrapper component to load the child component on client only. */
const ClientOnly: FunctionComponent<PropsWithChildren> = (props) =>
  props.children;

export default dynamic(() => Promise.resolve(ClientOnly), {
  ssr: false,
});
