import ProductProfileClient from "./ProductProfileClient";

// For static export with dynamic routes, we need to provide at least one param
// Since this is an Electron app with in-memory data, we return an empty array
// which will cause the page to be rendered at runtime
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function ProductProfilePage() {
  return <ProductProfileClient />;
}
