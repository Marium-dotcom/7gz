import { getUsers } from '@/libs/actions/user';
import UsersTable from './usersTable';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage roles and access for registered users.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
