import { MarkIcon } from "@/components/icons";

export default function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container about-grid">
        <div className="about-media reveal">
          <img
            src="https://images.pexels.com/photos/30726403/pexels-photo-30726403.jpeg?auto=compress&cs=tinysrgb&w=900"
            alt="Photographer capturing a moment on location"
          />
        </div>
        <div>
          <div className="eyebrow reveal">
            <MarkIcon />
            SINCE 2008
          </div>
          <h2 className="reveal">Rooted in Palestine, seen everywhere.</h2>
          <p className="lede reveal reveal-delay-1">
            Dream Studio began in 2008 as one photographer with a camera and a
            conviction: that the moments happening right in front of us deserve
            the same care as any film set. Today we&apos;re a full photography
            and videography house working across weddings, portraits, brand
            campaigns and short films — but the instinct hasn&apos;t changed. We
            slow down, watch closely, and hold on to what matters.
          </p>
          <div className="stat-grid reveal reveal-delay-2">
            <div className="stat">
              <div className="num">2008</div>
              <div className="lbl">Founded</div>
            </div>
            <div className="stat">
              <div className="num">17+</div>
              <div className="lbl">Years Active</div>
            </div>
            <div className="stat">
              <div className="num">900+</div>
              <div className="lbl">Projects Delivered</div>
            </div>
            <div className="stat">
              <div className="num">300+</div>
              <div className="lbl">Happy Clients</div>
            </div>
          </div>
          <p className="pull reveal reveal-delay-3">
            We don&apos;t direct life — we wait for it to happen, and
            we&apos;re ready when it does.
          </p>
        </div>
      </div>
    </section>
  );
}
