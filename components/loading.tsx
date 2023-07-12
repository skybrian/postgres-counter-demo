import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";

export function LoadingScreen(props: PageProps) {
  return (
    <>
      <Head>
        <meta http-equiv="refresh" content={`5;url=${props.url}`} />
        <title>Loading...</title>
        <style>
          {`
body {
  color: #f8f8f2;
  background-color: #282a36;
  margin: 16px;
}
.connecting {
    margin-top: 30px;
    margin-bottom: 30px;
    padding: 30px;
    border: 1px solid #bd93f9
}
`}
        </style>
      </Head>
      <div class="connecting">
        Loading...
      </div>
    </>
  );
}
