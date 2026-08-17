import Script from "next/script";

const clarityProjectId = "y3tct90a9r";
const googleAnalyticsId = "G-9NRJ5W0EF6";
const analyticsEnabled =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_SITE_URL === "https://enchantmentcalculator.com";

export function SiteAnalytics() {
  if (!analyticsEnabled) return null;

  return (
    <>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityProjectId}");`}
      </Script>
      <Script
        id="google-analytics-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}');`}
      </Script>
    </>
  );
}
