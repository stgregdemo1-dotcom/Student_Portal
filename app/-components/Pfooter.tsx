
import Image from "next/image";

type ContactIconType = "phone" | "email" | "location";

const iconPaths: Record<ContactIconType, string> = {
  phone:
    "M5 3h3l2 5-2 1.5a15 15 0 0 0 6.5 6.5L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z",
  email:
    "M3 5h18v14H3z M3 6l9 7 9-7",
  location:
    "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};

function ContactIcon({ type }: { type: ContactIconType }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC107]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[type]} />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      id="Contact"
      className="scroll-mt-24 bg-[#0D2B45] text-white"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:gap-16">
          {/* School Information */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/logo1.jpg"
                alt="Saint Gregory College seal"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-white/40 object-cover"
              />

              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide">
                  Saint Gregory
                </h2>

                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/75">
                  College of Science and Technology
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/75">
              Providing education in science and technology and helping
              students build practical skills for their future.
            </p>
          </div>

          {/* Contact Information */}
          <address className="not-italic">
            <h3 className="mb-4 text-sm font-bold text-white">
              Contact Us
            </h3>

            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <ContactIcon type="phone" />

                <a
                  className="hover:text-[#FFC107]"
                  href="tel:+63464321680"
                >
                  (046) 432-1680 / (046) 526-4628
                </a>
              </li>

              <li className="flex items-start gap-3">
                <ContactIcon type="email" />

                <a
                  className="break-all hover:text-[#FFC107]"
                  href="mailto:SG2015gregorians@gmail.com"
                >
                  SG2015gregorians@gmail.com
                </a>
              </li>

              <li className="flex items-start gap-3 leading-6">
                <ContactIcon type="location" />

                <a
                  className="hover:text-[#FFC107]"
                  href="https://www.google.com/maps/place/Saint+Gregory+College+Of+Science+And+Technology/@14.4718242,120.8877842,71m/data=!3m1!1e3!4m6!3m5!1s0x339632b105cb1b21:0x35cc36eb41c79a67!8m2!3d14.471981!4d120.88776!16s%2Fg%2F11bxg0t3xv?entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2nd/3rd Floor Saint Michael Bldg., Alejandro St.
                  Manila-Cavite Blvd. Sta. Cruz, Cavite City
                </a>
              </li>
            </ul>
          </address>
        </div>

        {/* Copyright */}
        <div className="mt-9 border-t border-white/15 pt-5 text-center text-xs text-white/65 sm:text-left">
          © {new Date().getFullYear()} Saint Gregory College of Science
          and Technology. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
