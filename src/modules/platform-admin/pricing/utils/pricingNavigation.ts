export type PricingSectionTab = "weight-slabs" | "service-types" | "locations";

export function getPricingSectionTab(pathname: string): PricingSectionTab {
  if (pathname.includes("/service-types")) {
    return "service-types";
  }

  if (pathname.includes("/locations")) {
    return "locations";
  }

  return "weight-slabs";
}

export function buildPricingReturnPath(tab: PricingSectionTab) {
  return `/admin/pricing?tab=${tab}`;
}
