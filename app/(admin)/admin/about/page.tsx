import { getAbout } from '@/libs/actions/about';
import AboutForm from './aboutForm';

export default async function AdminAboutPage() {
  const about = await getAbout();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">About Section</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the about section displayed on the site.
        </p>
      </div>

      <AboutForm initialData={about} />
    </div>
  );
}
