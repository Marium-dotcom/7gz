import { getMyDoctorProfile } from '@/libs/actions/doctor';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DoctorProfileForm from './doctorProfileForm';

export default async function DashboardProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'doctor') redirect('/');

  const profile = await getMyDoctorProfile();

  return (
    <div className="min-h-screen bg-[#E5F3FB]">
      <div className="mx-auto w-full max-w-3xl px-10 py-20">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-black">My Profile</h1>
          <p className="mt-1 text-sm text-black/50">Update your public profile information.</p>
        </div>
        <DoctorProfileForm initialData={profile} />
      </div>
    </div>
  );
}
