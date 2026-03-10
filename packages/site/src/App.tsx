import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { DesignShowcase } from "./components/DesignShowcase";

export function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <DesignShowcase />
      </main>
    </>
  );
}
