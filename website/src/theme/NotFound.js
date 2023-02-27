import React from "react";
import NotFound from "@theme-original/NotFound";
import Home from "../pages/index";
export default function NotFoundWrapper(props) {
  return (
    <>
      <Home notFound={true} />
    </>
  );
}
