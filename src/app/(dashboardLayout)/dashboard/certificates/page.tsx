import CertificateList from "@/components/certificates/CertificateList";

export default function StudentCertificatesPage() {
  return (
    <div className="max-w-4xl">
      <CertificateList mode="student" />
    </div>
  );
}
