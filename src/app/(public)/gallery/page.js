import { db } from "@/lib/db";
import { PageHero, EmptyState } from "@/components/Bits";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await db.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <>
      <PageHero title="Gallery">A look at our hospital, our team and our community.</PageHero>
      <section className="section">
        <div className="wrap">
          {images.length === 0 ? (
            <EmptyState title="No photos yet">An administrator can upload photos from the admin portal.</EmptyState>
          ) : (
            <GalleryGrid images={images} />
          )}
        </div>
      </section>
    </>
  );
}
