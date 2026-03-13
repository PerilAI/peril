import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TrustSignals } from "./components/TrustSignals";
import { AnnotationPlayground } from "./components/AnnotationPlayground";
import { HowItWorks } from "./components/HowItWorks";
import { UseCases } from "./components/UseCases";
import { SocialProof } from "./components/SocialProof";
import { Footer } from "./components/Footer";
import { Pricing } from "./components/Pricing";
import { DocsLayout } from "./docs/DocsLayout";
import { docsRoutes } from "./docs/routes";

function HomePage() {
  return (
    <main id="main" className="sf-grain">
      <Hero />
      <AnnotationPlayground />
      <TrustSignals />
      <HowItWorks />
      <UseCases />
      <SocialProof />
      <Footer />
    </main>
  );
}

export function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <HomePage />
            </>
          }
        />
        <Route
          path="/pricing"
          element={
            <>
              <Header />
              <Pricing />
            </>
          }
        />
        <Route path="/docs" element={<DocsLayout />}>
          {docsRoutes.map((route) => (
            <Route
              key={route.path}
              index={route.path === ""}
              path={route.path || undefined}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </>
  );
}
