import "../gallery.css";
import StudioLogo from "@/components/StudioLogo";

export default function Gallery() {
  return (
    <>
      <header className="gallery-band">
        <div className="gallery-band-inner">
          <div>
            <StudioLogo onDark />
            <h1 className="gallery-names">Gallery</h1>
          </div>
        </div>
      </header>
    </>
  );
}
