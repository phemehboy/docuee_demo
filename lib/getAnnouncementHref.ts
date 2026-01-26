export function getAnnouncementHref({
  type,
  actionLink,
  id,
  userType,
}: {
  type: string;
  actionLink?: string | null;
  id: string;
  userType: string;
}) {
  if (type !== "announcement")
    return { href: actionLink ?? "#", external: false };

  const base = `/user/${id}/usertype/${userType}/dashboard`;

  if (!actionLink || actionLink.trim() === "") {
    return { href: base, external: false }; // Default: general dashboard
  }

  const trimmed = actionLink.trim();

  switch (trimmed) {
    case "billing":
      return { href: `${base}/billing`, external: false };

    case "resources":
      return { href: `${base}/resources`, external: false };

    case "courses":
      return { href: `${base}/courses`, external: false };

    case "projects":
      if (userType === "student") {
        return { href: base, external: false };
      }
      return { href: `${base}/projects`, external: false };

    case "custom":
      return { href: "#", external: false }; // fallback if no URL provided

    default:
      // ✅ Handle full URLs for custom/external links
      if (/^https?:\/\//.test(trimmed)) {
        return { href: trimmed, external: true };
      }

      return { href: base, external: false };
  }
}
