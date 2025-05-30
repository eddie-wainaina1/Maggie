import { Typography } from "@mui/material";
import styles from "@/app/page.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <Typography variant="body2" color="text.secondary" align="center">
        {`Copyright © Maggie(theewnfamily.com) ${currentYear}`}
      </Typography>
    </footer>
  );
}
