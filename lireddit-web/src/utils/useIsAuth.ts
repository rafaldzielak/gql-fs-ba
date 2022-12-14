import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();

  console.log(router);

  useEffect(() => {
    if (!data?.me && !fetching) router.replace("/login?next=" + router.pathname);
  }, [data]);
};
