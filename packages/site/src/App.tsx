import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { AnnotationPlayground } from "./components/AnnotationPlayground";

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
      </main>
    </>
  );
}
