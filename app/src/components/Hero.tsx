export function Hero() {
  return (
    <div className="relative z-10 px-4 pt-28 sm:px-6 sm:pt-36 md:pt-44">
      <div className="mx-auto max-w-6xl">
        <span
          className="liquid-glass animate-fade-up delay-1 mb-5 inline-block rounded-lg px-4 py-1.5 text-xs text-white sm:mb-6 sm:text-sm"
          style={{ background: 'rgba(255, 255, 255, 0.16)' }}
        >
          Студия звукозаписи · Москва
        </span>

        <h1 className="animate-fade-up delay-2 max-w-3xl font-display text-4xl uppercase leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
          твой звук.
          <br />
          твои правила.
        </h1>

        <p className="animate-fade-up delay-3 mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base md:text-lg">
          Запись, сведение и продакшн для тех, кто формирует новую волну.
        </p>

        <div className="animate-fade-up delay-4 mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="booking.html"
            className="rounded-xl bg-white px-7 py-2.5 text-center text-sm text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Записаться
          </a>
          <a
            href="artists.html"
            className="liquid-glass rounded-xl px-7 py-2.5 text-center text-sm text-white transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Наши артисты
          </a>
        </div>
      </div>
    </div>
  );
}
