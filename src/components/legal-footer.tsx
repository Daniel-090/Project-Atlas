import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 pb-6 text-center text-[11px] tracking-wide text-muted">
      <span>© {new Date().getFullYear()} Atlas</span>
      <span aria-hidden="true">·</span>
      <Link href="/legal" className="hover:text-primary hover:underline">
        Información legal
      </Link>
      <Link href="/privacidad" className="hover:text-primary hover:underline">
        Privacidad
      </Link>
      <Link href="/cookies" className="hover:text-primary hover:underline">
        Cookies
      </Link>
      <Link href="/terminos" className="hover:text-primary hover:underline">
        Términos y condiciones
      </Link>
    </footer>
  );
}
