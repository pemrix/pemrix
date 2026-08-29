import ProductDashboard from "@/components/sections/product-dashboard";
import ProductFeatures from "@/components/sections/product-features";
import ProductLogs from "@/components/sections/product-logs";

export default function ProductPage() {
  return (
    <>
      <ProductDashboard />
      <ProductFeatures />
      <div className="relative">
        <div className="to-accent/50 bg-chart-1 absolute top-0 left-0 -z-3 hidden size-40 -translate-x-1/4 -translate-y-1/2 rounded-full will-change-transform lg:block" />
        <ProductLogs />
      </div>
    </>
  );
}
