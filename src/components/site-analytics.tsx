import Script from "next/script";

const clarityProjectId = "y3tct90a9r";
const googleAnalyticsId = "G-9NRJ5W0EF6";
const productionHostname = "enchantmentcalculator.com";

export function SiteAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`if (window.location.hostname === "${productionHostname}") {
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${clarityProjectId}");
        }`}
      </Script>
      <Script id="google-analytics" strategy="afterInteractive">
        {`if (window.location.hostname === "${productionHostname}") {
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
          window.gtag('js', new Date());
          window.gtag('config', '${googleAnalyticsId}');
          var gtagScript = document.createElement('script');
          gtagScript.async = true;
          gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}';
          document.head.appendChild(gtagScript);
        }`}
      </Script>
    </>
  );
}
