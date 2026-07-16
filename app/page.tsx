import HeroIntro from "../components/Landing/HeroIntro";
import RolePicker from "../components/Landing/RolePicker";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <HeroIntro />
        <RolePicker />
      </main>
      <Footer />
    </>
  );
}
