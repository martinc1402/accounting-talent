"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { trackMeta } from "@/lib/meta-pixel";

/*
  The Meta Pixel base code, adapted from Meta's snippet into Next.

  This component is only rendered at all in production with a configured pixel id
  (app/layout.tsx gates on VERCEL_ENV === "production" && NEXT_PUBLIC_META_PIXEL_ID).
  So there is no environment check here — if it renders, the pixel is meant to run.

  Two behaviours the raw snippet doesn't cover:

  - /assessment/* is excluded entirely. Those pages are reached only by a private
    tokenised link, and must load no pixel and fire no PageView. The component
    returns null there, so neither the loader script nor the noscript image is
    emitted.

  - PageView on client-side navigation. The inline snippet fires the FIRST
    PageView on load; a pathname effect fires it again on each subsequent SPA
    route change, skipping the very first run so the initial view isn't
    double-counted, and skipping assessment routes.
*/
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const isAssessment = pathname?.startsWith("/assessment") ?? false;
  const firstRun = useRef(true);

  useEffect(() => {
    // The inline script already fired PageView for the initial pathname.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (isAssessment) return;
    trackMeta("PageView");
  }, [pathname, isAssessment]);

  // No pixel on assessment pages: not even the loader or the noscript beacon.
  if (isAssessment) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
