import Script from "next/script";

export default function Head() {
  return (
    <>
      <meta name="google-adsense-account" content="ca-pub-5504771682915102" />
    
      <Script
        id="adsense-init"
        async
        strategy="afterInteractive"
       src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5504771682915102"
        crossOrigin="anonymous"
      />
    </>
  );
}
