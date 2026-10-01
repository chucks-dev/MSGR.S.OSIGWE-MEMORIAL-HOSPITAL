import { db } from "@/lib/db";
import GalleryAdmin from "@/components/GalleryAdmin";

export const metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const images = await db.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return <GalleryAdmin images={images} />;
}
