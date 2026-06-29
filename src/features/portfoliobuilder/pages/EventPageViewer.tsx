import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const data = {
  "meta": {
    "title": "Emma & James | Wedding Celebration"
  },
  "navigation": {
    "logo": "E & J"
  },
  "hero": {
    "backgroundImage": "https://lh3.googleusercontent.com/aida-public/AB6AXuApQF_TscatZ-WtxXXQiR-KzV0MgntGtfi5bIhsIypvEQ8ScEf3hhCmDn7AZk_2KOoqLoyVos_POagrwhDSuHksHWPznCmQJSj1EhXGsyxpYOZi8kg49VV-ldShE1zGfROXLDaG8wCNR389ElgJPSQTWCZmyWbmwwqOPxKWafSdI0G4VnvoTx5e_ayRybwSCyJwfEiAdr4vLWsiEoZPD-MZtYJHBgteqh_LYiDtvXXQc4GIpfSKGaY1-DmIOCplZK9D8AwUcPlotc5P",
    "subtitle": "THE WEDDING OF",
    "title": "Emma & James",
    "date": "Saturday, June 21, 2025"
  },
  "invitation": {
    "imageUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuBQPg8Gxh_dQsmHYbXAtIGrFZGvgKLQpOSzAPyO9BsRR2z9fDF93QMyrTrai9UaWruMW1kkw_3pFnqCMirJbEE9JZJu5-0gwKy5mnFLPlNfWAYT79Wpv30fGP86LBtzqjRg1kegxUw4uHtTAunfKS8_HR1lMWqfVanvZYWKpkpuO7yU3EhqSHjP5o3g7p88V9AT4y60F8otgtS7AYebNKJj7tzVJEXAD2aZVa5XGTH_1vaCq4kzCDRFvvY9aF315xCZ_MKe_VACM-FK",
    "imageAlt": "Wedding details close-up",
    "subtitle": "SAVE THE DATE",
    "title": "We invite you to celebrate our union",
    "description": "In the presence of family and friends, join us as we exchange vows and begin our new chapter together in the heart of Napa Valley."
  },
  "details": {
    "events": [
      {
        "type": "ceremony",
        "icon": "church",
        "subtitle": "CEREMONY",
        "time": "4:00 PM",
        "address": "The Glass House\n123 Orchard Lane, Napa Valley"
      },
      {
        "type": "reception",
        "icon": "celebration",
        "subtitle": "RECEPTION",
        "time": "5:30 PM",
        "address": "To follow at the same location\nDinner, Drinks, & Dancing"
      }
    ],
    "calendarCta": "ADD TO CALENDAR"
  },
  "location": {
    "title": "Getting There",
    "description": "The Glass House is located nestled among the rolling hills of Napa. We recommend arriving 20 minutes early to enjoy the garden view before the ceremony begins.",
    "mapImage": "https://lh3.googleusercontent.com/aida-public/AB6AXuD97PJ_ziVk-X9zin-fyOBT-7NXPVmyhwqJXzAAH_C15awM59a_pFWj4I0m-Nm_hCVSB3L2WP7HoiWPfj-6TJg_BLgsqad1ZNROMoT_yrCG_qjm2v3flatk4kRidA5wweXtrVCUkz3LI-JgVObhssQQY2zSU1ay0ugA4Fq8c_bLGC8-4oJV6SJPt64ZzZW7ys2M7EECmiq2LTbZGpA485Qlp0Z-7CaqxfloAOvQplpCN-bD3m2zZ4A4vn29dorQPVJLhLS_XydwiMDO",
    "mapLocation": "Napa Valley, California",
    "buttonText": "OPEN IN GOOGLE MAPS",
    "buttonLink": "#"
  },
  "gallery": {
    "subtitle": "GALLERY",
    "title": "Our Moments",
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBGf_LIKMUTqdfGvp0GJrBSfca63oeoG-Leh25yHeRzrVO5V0x0qMEodUoYX2aw5ydsjDZtc1TVQp5yFrxF4h0iftMtmYVdw4VhFLgEcIbzfC_Nb2aMwiFMtqUv8r95rMVzUnh8bljxQ3T6Gol6KRKkEZ9EkzGncZr07vdvEKhCcIRy3eyOs36-1KtFhHaPRNUEqjgyVTdJb7_gtR5iolWZczOO6O-Xsg4aTfyVuVjJZ76OlNYSnssPzYSlpM96s81aWRq2EVDP3QEK",
        "alt": "Wedding reception table"
      },
      {
        "url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAwALXoj9PIJ0BReekaiZ06Q6huvAEJvWCdYf3jTd_90KAGKnN4LjRf4r-CNzhbdvd9ED8y9aQlA04SJQ3efBgkIPfXzuxE8B_XW_MICUH2xitl0dsto7LE8UsPeq6M800ze6NH_gc3351nheS4gs7MB7d2peHZeCfEinwTIyX8c7Ozz77CVpFjg80svUogAMrgKS8geZht7U53KoUNdfWtUQHubYWS8jIKRhwUt0n2ZOQE_6NNq_y1mNHLqYqTYeeGDDeFRGGrEGeL",
        "alt": "Wedding bouquet"
      },
      {
        "url": "https://lh3.googleusercontent.com/aida/AP1WRLtLcPqOGvWx5i_P69dQSDPfH8lTw1hUxfJ8SXqjunTEXBtGcJCFvc-juE7xGTllbfAmRD6G_yD76J-BVzgwQew-crWAwjGBWYlnu_0SmqbWbd8qOEUjw5DuaQNlGjV62Xwin94SaAdfozuZYAq4UaFQKI8HmyWbKV8f7nlJH_51uvmeqzI9KAQUgZ_y-XTpubLQorQCW81Opl4GcT_TgsA-7Ko3VEaRi62drRmtc7wMxfLN1UCtJqshoiEB",
        "alt": "Wedding rings"
      }
    ],
    "quote": "Capturing the beauty of our beginning."
  },
  "footer": {
    "logo": "E & J",
    "text": "We can't wait to celebrate with you.",
    "copyright": "© 2025 EMMA AND JAMES"
  },
  "mobileNavigation": {
    "home": "HOME",
    "details": "DETAILS",
    "gallery": "GALLERY"
  }
}
  ;
const EventPageViewer: React.FC = () => {
  const { eventpath } = useParams<{ eventpath: string }>();

  return <div style={{ width: "100%", height: "100vh" }}>
    <iframe
      src={"/html/" + eventpath + ".html"}
      width="100%"
      height="100%"
    />
  </div>
};

export default EventPageViewer;