import type { Metadata } from 'next';
import './globals.css';
import './editorial.css';
const title='FaradayDesk — Before the open';
const description='Stress-test a Bitget stock-token thesis against observed weekend history. Private notes stay in your browser.';
const url='https://faradaydesk.up.railway.app/';
export const metadata:Metadata={metadataBase:new URL(url),title,description,icons:{icon:'/favicon.svg'},alternates:{canonical:url},
 openGraph:{type:'website',siteName:'FaradayDesk',title,description,url,images:[{url:'/og-image.png',width:1200,height:630,alt:'FaradayDesk. Evidence before conviction.'}]},
 twitter:{card:'summary_large_image',title,description,images:['/og-image.png']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
