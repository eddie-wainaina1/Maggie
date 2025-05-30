import { Box } from "@mui/material";
import Footer from "./footer";
import Header from "./header";

import styles from "@/app/page.module.css";

export default function PageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Box
      sx={{
        paddingLeft: 0,
        paddingRight: 2,
      }}
    >
      <header>
        <Header />
      </header>
      <main className={styles.main}>{children}</main>
      <Footer />
    </Box>
  );
}
