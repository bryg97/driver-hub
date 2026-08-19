export interface CompanyConfig {
  companyName: string;
  timezone: string;
  logoUrl: string;
  primaryColor: string;
  cities: string[];
}

export const companyConfig: CompanyConfig = {
  companyName: "MX TAXI",
  timezone: "America/Mexico_City",
  logoUrl: "/favicon.ico",
  primaryColor: "#0f766e",
  cities: ["CDMX", "EDOMEX"],
};
