'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Box, Button, TextField } from '@mui/material';
import { FormEvent } from 'react';

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const queryTerm = formData.get('search') as string;
    router.push(`${pathname}?search=${queryTerm}`);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
    >
      <TextField 
        id="search" 
        name="search" 
        label="Search for users" 
        variant="outlined" 
        size="small"
      />
      <Button type="submit" variant="contained">
        Search
      </Button>
    </Box>
  );
};
