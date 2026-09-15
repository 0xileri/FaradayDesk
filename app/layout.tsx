import type { Metadata } from 'next';
import './globals.css';
import './editorial.css';
export const metadata:Metadata={title:'FaradayDesk — Before the open',description:'Stress-test a tokenized stock thesis with sourced historical context and browser-local disclosure controls.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
