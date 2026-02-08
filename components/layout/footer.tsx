import { GithubIcon, Linkedin01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const socialLinks = [
  {
    icon: GithubIcon,
    href: "https://github.com",
    label: "GitHub",
  },
  {
    icon: Linkedin01Icon,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: Mail01Icon,
    href: "mailto:hello@example.com",
    label: "Email",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-12">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}
        </p>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HugeiconsIcon icon={link.icon} size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
