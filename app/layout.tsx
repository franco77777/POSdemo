import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "./components/ProductContext";
import { SalesProvider } from "./components/SalesContext";
import { ActivityProvider } from "./components/ActivityContext";
import { ActivityBridge } from "./components/ActivityBridge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema POS - Punto de Venta",
  description: "Sistema moderno de punto de venta para gestión de inventario y ventas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ActivityProvider>
          <ProductProvider>
            <SalesProvider>
              <ActivityBridge />
              {children}
            </SalesProvider>
          </ProductProvider>
        </ActivityProvider>
      </body>
    </html>
  );
}
