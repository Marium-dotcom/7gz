import { getServices } from '@/libs/actions/service';
import ServicesForm from './servicesForm';

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Services Section</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the services displayed on the homepage.
        </p>
      </div>

      <ServicesForm initialData={services} />
    </div>
  );
}
