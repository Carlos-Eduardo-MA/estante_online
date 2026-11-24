import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, EB_Garamond } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel-decorative",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Estante: sua biblioteca pessoal",
    template: "%s · Estante",
  },
  description:
    "Organize o que você quer ler, está lendo e já leu. Busque livros no catálogo da Open Library e mantenha sua estante em um só lugar.",
};

export const viewport: Viewport = {
  themeColor: "#FFFDF2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${ebGaramond.variable} ${cinzelDecorative.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
