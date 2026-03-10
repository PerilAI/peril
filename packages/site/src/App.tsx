import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { AnnotationPlayground } from "./components/AnnotationPlayground";
import { HowItWorks } from "./components/HowItWorks";
import { UseCases } from "./components/UseCases";

export function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <AnnotationPlayground />
        <HowItWorks />
        <UseCases />
      </main>
    </>
  );
}
