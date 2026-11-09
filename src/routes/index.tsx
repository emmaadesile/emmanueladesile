import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Projects } from "../components/Projects";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
      </main>
      <Footer />
    </>
  );
}
