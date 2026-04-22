import { getHero } from '@/libs/actions/hero';
import { auth } from '@/auth';
import { connectToDB } from '@/libs/mongoose';
import Doctor from '@/libs/models/doctor';
import Link from 'next/link';
import Image from 'next/image';
import DoctorSearchBar from './doctor-search-bar';

export const Hero = async () => {
  const [hero, session] = await Promise.all([getHero(), auth()]);
  if (!hero) return null;

  const role = session?.user?.role;
  const firstName = session?.user?.name?.split(' ')[0] ?? '';
  const greeting =
    role === 'admin'  ? `Hello, Admin` :
    role === 'doctor' ? `Hello, Dr. ${firstName}` :
    session?.user    ? `Hello, ${firstName}` :
    null;

  let doctorSlug: string | null = null;
  if (role === 'doctor' && session?.user?.email) {
    await connectToDB();
    const { default: User } = await import('@/libs/models/user');
    const user = await User.findOne({ email: session.user.email }).lean();
    if (user) {
      const doc = await Doctor.findOne({ user: user._id }).lean();
      if (doc) doctorSlug = doc.licenseNumber;
    }
  }

  const bg = hero.background;
  const hasHeroImage = !!hero.image?.url;

  const bgStyle =
    bg?.type === 'color' && bg.color
      ? { backgroundColor: bg.color }
      : bg?.type === 'image' && bg.imageUrl
      ? { backgroundImage: `url(${bg.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {};

  const onDark = bg?.type === 'image' || (bg?.type === 'color' && isDark(bg.color));

  return (
    <section className="w-full relative" style={bgStyle}>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-10 pb-16  pt-10">

        {greeting && (
          role === 'admin' ? (
            <Link
              href="/admin/hero"
              className={`inline-flex items-center self-start rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-opacity hover:opacity-70 ${onDark ? 'border-white/30 text-white' : 'border-[#103D48]/30 text-[#103D48]'}`}
            >
              {greeting}
            </Link>
          ) : role === 'doctor' && doctorSlug ? (
            <Link
              href={`/book/${doctorSlug}`}
              className={`inline-flex items-center self-start rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-opacity hover:opacity-70 ${onDark ? 'border-white/30 text-white' : 'border-[#103D48]/30 text-[#103D48]'}`}
            >
              {greeting}
            </Link>
          ) : role === 'doctor' ? (
            <Link
              href="/doctor/profile"
              className={`inline-flex items-center self-start rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-opacity hover:opacity-70 ${onDark ? 'border-white/30 text-white' : 'border-[#103D48]/30 text-[#103D48]'}`}
            >
              {greeting}
            </Link>
          ) : session?.user ? (
            <Link
              href="/profile"
              className={`inline-flex items-center self-start rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-opacity hover:opacity-70 ${onDark ? 'border-white/30 text-white' : 'border-[#103D48]/30 text-[#103D48]'}`}
            >
              {greeting}
            </Link>
          ) : null
        )}

        {/* Hero content */}
        {hasHeroImage ? (
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <TextBlock hero={hero} onDark={onDark} />
            </div>
            <div className="w-full max-w-sm shrink-0 lg:max-w-none lg:w-auto">
              <Image
                src={hero.image!.url!}
                alt={hero.image?.alt || ''}
                width={700}
                height={1400}
                className="mx-auto object-contain"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl text-center">
            <TextBlock hero={hero} onDark={onDark} centered />
          </div>
        )}
<div className="absolute left-1/2 -bottom-5 hidden w-full max-w-7xl -translate-x-1/2 -translate-y-1/2 px-10 lg:block">
  <DoctorSearchBar />
</div>
        {/* Search bar — same width as content */}

      </div>

    </section>
  );
};

type Hero = NonNullable<Awaited<ReturnType<typeof getHero>>>;

function TextBlock({
  hero,
  onDark,
  centered = false,
}: {
  hero: Hero;
  onDark: boolean;
  centered?: boolean;
}) {
  return (
    <>
      {hero.subtitle && (
        <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          <span
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${
              onDark
                ? 'border-[#EAFBFF]/40 text-[#EAFBFF]'
                : 'border-[#2F5795]/30 text-[#2F5795]'
            }`}
          >
            {hero.subtitle}
          </span>
        </div>
      )}

      <h1
        className={`text-4xl font-extrabold leading-[1.1] tracking-tight lg:text-4xl xl:text-4xl ${
          onDark ? 'text-white' : 'text-gray-950'
        }`}
      >
        {hero.title}
      </h1>

      {hero.description && (
        <p
          className={`max-w-2xl text-lg leading-relaxed ${centered ? 'mx-auto' : ''} ${
            onDark ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {hero.description}
        </p>
      )}

      {(hero.ctaText || hero.secondaryCtaText) && (
        <div className={`flex flex-wrap gap-4 pt-2 ${centered ? 'justify-center' : ''}`}>
          {hero.ctaText && hero.ctaLink && (
            <Link
              href={hero.ctaLink}
              className="inline-block bg-[#103D48] px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[103D48]/50"
            >
              {hero.ctaText}
            </Link>
          )}
          {hero.secondaryCtaText && hero.secondaryCtaLink && (
            <Link
              href={hero.secondaryCtaLink}
              className={`inline-block border px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-colors ${
                onDark
                  ? 'border-white/40 text-white hover:border-white hover:bg-white/10'
                  : 'border-gray-900 text-gray-900  '
              }`}
            >
              {hero.secondaryCtaText}
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function isDark(hex?: string): boolean {
  if (!hex) return false;
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
