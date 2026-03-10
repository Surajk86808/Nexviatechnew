export const metadata = {
  title: "Privacy Policy | NexviaTech",
  description: "Learn how NexviaTech collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="/NexviaTech_Privacy_Policy.pdf"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Privacy Policy"
      />
    </div>
  );
}

