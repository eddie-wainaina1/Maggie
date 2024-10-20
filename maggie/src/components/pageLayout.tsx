import { Sheet } from "@mui/joy";
import Footer from "./footer";
import Header from "./header";

import styles from "@/app/page.module.css";

export default function PageLayout (
    { children }: Readonly<{ children: React.ReactNode; }>
) {
    return (
        <Sheet sx={{
            paddingLeft: 10,
            paddingRight: 10
        }}>
            <header>
                <Header/>
            </header>
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                <Footer/>
            </footer>
        </Sheet>
    )
}