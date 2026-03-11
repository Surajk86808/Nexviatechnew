const WHATSAPP_MESSAGE = "Hi Suraj, I'm interested in NexviaTech's services. Can we chat?";
const WHATSAPP_URL = `https://wa.me/6299846516?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7">
    <path
      fill="#fff"
      d="M19.11 17.36c-.26-.13-1.52-.75-1.76-.84-.23-.08-.4-.13-.58.13-.17.25-.67.84-.82 1.01-.15.17-.3.19-.56.06-.26-.13-1.08-.4-2.06-1.28-.76-.68-1.28-1.53-1.43-1.79-.15-.25-.02-.39.11-.52.12-.12.26-.31.39-.47.13-.15.17-.25.26-.43.08-.17.04-.32-.02-.45-.07-.13-.58-1.39-.79-1.9-.21-.5-.42-.43-.58-.44h-.49c-.17 0-.45.06-.69.32-.24.25-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.84 2.8 4.46 3.93.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.52-.62 1.73-1.21.22-.6.22-1.11.15-1.21-.06-.1-.24-.17-.5-.3Z"
    />
    <path
      fill="#fff"
      d="M16 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.25.59 4.45 1.7 6.38L3.2 28.8l6.58-1.67A12.75 12.75 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2Zm0 23.3c-1.94 0-3.84-.52-5.5-1.5l-.4-.24-3.9.99 1.04-3.8-.26-.4A10.45 10.45 0 0 1 5.55 16c0-5.76 4.69-10.45 10.45-10.45S26.45 10.24 26.45 16 21.76 26.5 16 26.5Z"
    />
  </svg>
);

const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with NexviaTech on WhatsApp"
      className="whatsapp-float"
    >
      <span className="whatsapp-float__pulse" aria-hidden="true" />
      <span className="whatsapp-float__button">
        <WhatsAppIcon />
      </span>
    </a>
  );
};

export default WhatsAppButton;
