import { getDoctors } from '@/libs/actions/doctor';
import DoctorList from './doctorList';

export default async function AdminDoctorsPage() {
  const doctors = await getDoctors();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Doctors</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage doctor profiles, verification status, and availability.
        </p>
      </div>
      <DoctorList initialDoctors={doctors} />
    </div>
  );
}
