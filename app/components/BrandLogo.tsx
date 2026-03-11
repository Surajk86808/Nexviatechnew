import Image from "next/image";

type BrandLogoProps = {
  className?: string;
};

const BrandLogo = ({ className = "h-8 md:h-10 w-auto" }: BrandLogoProps) => {
  return (
    <span className="inline-flex items-center">
      <Image
        src="/nexviatechbgwhite.png"
        alt="Nexviatech Official Logo"
        width={220}
        height={56}
        priority
        className={`block dark:hidden ${className}`}
      />
      <Image
        src="/nextviatechbgblue.png"
        alt="Nexviatech Official Logo"
        width={220}
        height={56}
        priority
        className={`hidden dark:block object-contain dark:mix-blend-lighten ${className}`}
      />
    </span>
  );
};

export default BrandLogo;
