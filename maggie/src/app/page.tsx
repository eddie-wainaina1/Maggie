// import Image from "next/image";
import Marketplace from "@/components/marketplace";
import styles from "./page.module.css";

// const productSample = {
//   imageUrl:
//     "https://upload.wikimedia.org/wikipedia/commons/6/6e/Flowers_%28157722109%29.jpeg",
//   title: "flower",
//   description: "This is a flower",
//   price: 500,
//   currency: "KES",
//   rating: 3,
// };

export default function Home() {
  return (
    <div className={styles.page}>
      <Marketplace />
    </div>
  );
}
