import { getHero } from '@/libs/actions/hero';
import HeroForm from './heroForm';

export default async function AdminHeroPage() {
  const hero = await getHero();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Hero Section</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize the hero section displayed on the homepage.
        </p>
      </div>

      <HeroForm initialData={hero} />
    </div>
  );
}