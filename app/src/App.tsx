import { BoomerangVideoBg } from './components/BoomerangVideoBg';
import { Header } from './components/Header';

export function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <BoomerangVideoBg />
      <Header />
      <p className="relative z-10 p-6 text-white">YOUNGBLOOD hero — under construction</p>
    </div>
  );
}
