import { BoomerangVideoBg } from './components/BoomerangVideoBg';
import { Header } from './components/Header';
import { Hero } from './components/Hero';

export function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <BoomerangVideoBg />
      <Header />
      <Hero />
    </div>
  );
}
