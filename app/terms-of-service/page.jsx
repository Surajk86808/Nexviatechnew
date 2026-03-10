export const metadata = {
  title: "Terms of Service | NexviaTech",
  description: "Read the Terms of Service governing use of NexviaTech and its services.",
};

export default function TermsOfService() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="/NexviaTech_Terms_of_Service.pdf"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Terms of Service"
      />
    </div>
  );
}

