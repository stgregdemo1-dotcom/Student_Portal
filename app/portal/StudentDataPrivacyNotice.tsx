"use client";

import { useEffect } from "react";

type StudentDataPrivacyNoticeProps = {
  onAcknowledge: () => void;
  onClose: () => void;
};

export default function StudentDataPrivacyNotice({
  onAcknowledge,
  onClose,
}: StudentDataPrivacyNoticeProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071b2b]/70 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="student-privacy-title"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-left shadow-2xl"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[#0D2B45] px-5 py-4 text-white sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFC107]">
              Saint Gregory College of Science and Technology
            </p>
            <h2 id="student-privacy-title" className="mt-1 text-xl font-bold sm:text-2xl">
              Data Privacy Notice for Students
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close privacy notice"
            className="rounded-md px-2 py-1 text-2xl leading-none text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={onClose}
          >
            &times;
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 text-sm leading-6 text-slate-700 sm:px-7">
          <p>
            <strong>Draft for institutional review.</strong> This notice explains how
            Saint Gregory College of Science and Technology (SGCST or the School)
            handles student personal data in connection with its educational
            services and student portal. It should be completed with SGCST&apos;s
            verified practices and approved by the School&apos;s Data Protection
            Officer (DPO) or legal adviser before publication.
          </p>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              1. Introduction and legal basis
            </h3>
            <p className="mt-1">
              SGCST respects the privacy of its students and is responsible for
              handling their personal information in accordance with Republic Act
              No. 10173, or the Data Privacy Act of 2012 (DPA), its Implementing
              Rules and Regulations, and applicable National Privacy Commission
              (NPC) issuances. The School processes personal data only for
              legitimate, specific purposes and applies the principles of
              transparency, legitimate purpose, and proportionality.
            </p>
            <p className="mt-2">
              Depending on the particular processing activity, its purpose, and
              the circumstances, SGCST may rely on a lawful basis permitted by
              the DPA, such as compliance with a legal obligation, performance of
              a contract or steps requested before entering into one, protection
              of vital interests, or legitimate interests where applicable and
              properly balanced. Consent will be used when it is the appropriate
              legal basis, including for optional processing where required.
              Consent is not treated as the basis for every activity, and a
              general acknowledgment of this notice does not by itself constitute
              blanket consent. SGCST should identify the applicable basis for
              each activity in its finalized privacy documentation.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              2. Personal information collected and stored
            </h3>
            <p className="mt-1">
              As relevant to your relationship with the School and the service
              involved, SGCST may collect and process:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Full name, date of birth, and age;</li>
              <li>Home address and contact information, including email address;</li>
              <li>Student number, student photograph, and identification details;</li>
              <li>Educational background and academic records, including grades;</li>
              <li>Parent or guardian information, where applicable;</li>
              <li>Enrollment, admission, registration, and attendance information;</li>
              <li>
                Information needed for student services, scholarships, or
                financial assistance, when applicable; and
              </li>
              <li>
                Other information necessary for legitimate school operations,
                subject to applicable law and the principle of proportionality.
              </li>
            </ul>
            <p className="mt-2">
              The School should provide additional notice before collecting
              information not described here or where the purpose materially
              changes.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              3. Purposes of processing
            </h3>
            <p className="mt-1">
              SGCST may use student information, as appropriate, to process
              admission and enrollment; maintain academic records; monitor
              attendance and manage grades; issue or verify student
              identification; communicate with students and, where appropriate,
              their parents or guardians; provide school announcements and
              updates; evaluate scholarship or financial assistance applications
              when available; and deliver student services and other legitimate
              educational functions. Information will be limited to what is
              relevant and necessary for the stated purpose.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              4. Sensitive personal information
            </h3>
            <p className="mt-1">
              Where necessary for educational services or required or permitted
              by law, SGCST may process sensitive personal information, such as
              health-related information or other information classified as
              sensitive under the DPA. Access and use should be restricted to
              authorized persons and the specific purpose for which the
              information is needed. The School will process such information
              only under a lawful condition under the DPA and other applicable
              requirements, and will provide any additional notice or obtain
              consent when required.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              5. Data sharing and disclosure
            </h3>
            <p className="mt-1">
              Student information may be accessed by authorized SGCST personnel
              who need it for their assigned school duties. Information may also
              be disclosed to a parent or guardian when appropriate and legally
              permitted, taking account of the student&apos;s age, applicable law,
              and the circumstances. SGCST may disclose information to
              government agencies or other authorized parties when required or
              permitted by law, or to service providers acting for the School
              where necessary for a stated purpose and subject to appropriate
              safeguards. The School should identify relevant recipient
              categories and any applicable cross-border transfers in its
              finalized notice.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              6. Data storage and security
            </h3>
            <p className="mt-1">
              SGCST applies appropriate organizational, physical, and technical
              measures intended to protect personal data against unauthorized
              access, disclosure, alteration, loss, or destruction. Access should
              be limited to authorized persons with a legitimate need. No method
              of storage or transmission can be represented as completely
              secure. The School should describe its actual safeguards and
              reporting procedures in its internal policies and finalized
              materials.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              7. Data retention and disposal
            </h3>
            <p className="mt-1">
              SGCST retains student information only for as long as needed for
              the purpose for which it was collected, to meet applicable legal
              and regulatory requirements, and in accordance with the School&apos;s
              records-retention policies. The applicable retention periods for
              each record type must be confirmed by SGCST. When information is
              no longer needed, it will be securely disposed of or anonymized
              using methods appropriate to the record and applicable
              requirements.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              8. Your rights as a data subject
            </h3>
            <p className="mt-1">
              Subject to the conditions, exceptions, and limitations under the
              DPA and other applicable laws, students may exercise the right to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Be informed about the collection and processing of their
                personal data;
              </li>
              <li>Access personal data held by the School;</li>
              <li>Object to processing where the DPA allows;</li>
              <li>Request correction of inaccurate or incomplete information;</li>
              <li>
                Request erasure or blocking when legally applicable and
                appropriate;
              </li>
              <li>File a complaint with the NPC, subject to applicable procedures; and</li>
              <li>
                Seek damages when entitled under the DPA and applicable law.
              </li>
            </ul>
            <p className="mt-2">
              To make a request, contact the DPO using the details below. SGCST
              may need to verify your identity and will respond in accordance
              with applicable rules. Some requests may be limited where the
              School has a lawful reason to retain or process the information.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold text-[#0D2B45]">
              9. Contact the Data Protection Officer
            </h3>
            <p className="mt-1">
              For privacy questions or requests, contact SGCST&apos;s DPO:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Name: [SGCST DPO name]</li>
              <li>Email: [Official DPO email address]</li>
              <li>Office address: [Official DPO office address]</li>
              <li>Contact number: [Official DPO contact number]</li>
            </ul>
            <p className="mt-2">
              SGCST must replace these placeholders with verified official
              contact details before publishing this notice.
            </p>
          </section>

          <section className="mt-5 rounded-lg bg-slate-50 p-4">
            <h3 className="text-base font-bold text-[#0D2B45]">
              10. Student acknowledgment
            </h3>
            <p className="mt-1">
              By acknowledging this notice, I confirm that I have read and
              understood the information above, including the purposes for which
              SGCST may process my personal information and that the School
              relies on the lawful basis applicable to each processing activity.
              I understand that this acknowledgment records that the notice was
              presented to me; it is not blanket consent for all processing.
              Where consent is the appropriate lawful basis, SGCST will seek it
              separately and explain the relevant purpose. I understand that I
              may contact the DPO with questions or to exercise my rights,
              subject to applicable law.
            </p>
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D2B45]"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#0D2B45] px-5 py-2.5 font-semibold text-white hover:bg-[#17427F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D2B45] focus-visible:ring-offset-2"
            onClick={onAcknowledge}
          >
            I have read and acknowledge
          </button>
        </footer>
      </section>
    </div>
  );
}
