import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import Link from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery();

  if (!data) return null;

  return (
    <Layout>
      <Link href='/create-post'>Create post</Link>
      {data && data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);
