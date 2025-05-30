"use client";

import { useState, useTransition } from "react";
import { setRole, removeRole } from "@/utils/_actions";
import { Button, CircularProgress } from "@mui/material";

interface RoleButtonsProps {
  userId: string;
  currentRole: string;
}

export default function RoleButtons({ userId, currentRole }: RoleButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [role, setLocalRole] = useState(currentRole);

  const handleSetRole = (newRole: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", userId);
      formData.append("role", newRole);
      await setRole(formData);
      setLocalRole(newRole); // Update UI instantly
    });
  };

  const handleRemoveRole = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", userId);
      await removeRole(formData);
      setLocalRole("None");
    });
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        sx={{ mr: 1 }}
        onClick={() => handleSetRole("admin")}
        disabled={isPending}
      >
        {isPending && role === "admin" ? (
          <CircularProgress size={20} />
        ) : (
          "Make Admin"
        )}
      </Button>

      <Button
        variant="contained"
        color="secondary"
        size="small"
        sx={{ mr: 1 }}
        onClick={() => handleSetRole("moderator")}
        disabled={isPending}
      >
        {isPending && role === "moderator" ? (
          <CircularProgress size={20} />
        ) : (
          "Make Moderator"
        )}
      </Button>

      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleRemoveRole}
        disabled={isPending}
      >
        {isPending && role === "None" ? (
          <CircularProgress size={20} />
        ) : (
          "Remove Role"
        )}
      </Button>
    </>
  );
}
