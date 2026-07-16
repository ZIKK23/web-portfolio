import HeroIntro from "../components/Landing/HeroIntro";
import RolePicker from "../components/Landing/RolePicker";
import TechStackSection from "../components/Landing/TechStackSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <HeroIntro />
        <RolePicker />
        <TechStackSection />
      </main>
      <Footer />
    </>
  );
}
