import React from "react";
import SearchBar from "@theme-original/SearchBar";
import AskCookbook from "@cookbookdev/docsbot/react";

/** It's a public API key, so it's safe to expose it here */
const COOKBOOK_PUBLIC_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWRkMDNhZmRjZDY1NzI0ODdlMTQwN2IiLCJpYXQiOjE3MDg5ODMyMTUsImV4cCI6MjAyNDU1OTIxNX0.65S63eIZ_bkMJTF3bUzZb-vo_MeN9CXGSb5WNGYlf7M"

export default function SearchBarWrapper(props) {
  return (
    <>
      <SearchBar {...props} />
      <AskCookbook apiKey={COOKBOOK_PUBLIC_API_KEY} />
    </>
  );
}
