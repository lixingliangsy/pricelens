import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "tailwind.config={theme:{extend:{colors:{brand:'#4f46e5'}}}}",
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="waffo-verify" content="415a6e87fbc5c1894f453b1b39015b83" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
