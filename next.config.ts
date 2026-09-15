import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["imapflow", "pg"],
  // Permite abrir el entorno de desarrollo desde el proxy de vista previa.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;