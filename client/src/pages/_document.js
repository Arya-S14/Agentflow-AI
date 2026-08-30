import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta name="description" content="Agentflow_AI - Full-Stack Agentic AI Operations Automation Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-dark-bg text-slate-100 font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
