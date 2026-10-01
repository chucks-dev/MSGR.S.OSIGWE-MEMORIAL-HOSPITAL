import { Icon } from "./Icons";
import { toTelHref, toWhatsAppHref } from "@/lib/settings";

export default function ContactList({ s }) {
  const items = [
    { icon: "pin", label: "Address", value: s.address },
    { icon: "phone", label: "Phone", value: s.phone, href: toTelHref(s.phone) },
    { icon: "whatsapp", label: "WhatsApp", value: s.whatsapp, href: toWhatsAppHref(s.whatsapp) },
    { icon: "mail", label: "Email", value: s.email, href: s.email ? `mailto:${s.email}` : "" },
    { icon: "clock", label: "Opening hours", value: s.hours },
  ].filter((i) => i.value);

  return (
    <ul className="contact-list">
      {items.map((i) => (
        <li key={i.label}>
          <Icon name={i.icon} />
          <span>
            <strong>{i.label}</strong>
            {i.href ? <a href={i.href}>{i.value}</a> : <span style={{ whiteSpace: "pre-line" }}>{i.value}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
