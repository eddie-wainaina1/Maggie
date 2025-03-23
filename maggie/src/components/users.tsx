"use client";
import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { SearchUsers } from '@/components/searchUsers';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import RoleButtons from './RoleButtons';
import { useEffect, useState } from 'react';
// import type { User } from '@clerk/nextjs/server';


type EmailAddress = { id: string; emailAddress: string };
interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddressId: string | null;
  emailAddresses: EmailAddress[];
  publicMetadata: { role?: string };
}

interface UsersProps {
  searchParams?: { search?: string };
}

export default function Users({ searchParams }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async() => {
    const query = searchParams?.search || '';
    const res = await fetch(`/api/users${query}`);
    type userRes = {data: User[]}
    const _users_data: unknown= await res.json();
    const _users: User[] = _users_data as User[];
    setUsers(_users as User[]);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        This is a protected admin dashboard restricted to users with the <b>admin</b> role.
      </Typography>

      <SearchUsers />

      <Box mt={2}>
        {users.map((user: User) => (
          <Card key={user.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Role: <b>{user.publicMetadata.role || 'None'}</b>
              </Typography>
              <RoleButtons userId={user.id} currentRole={user.publicMetadata.role || 'None'} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
