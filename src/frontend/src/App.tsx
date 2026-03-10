import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { SellProvider } from "./context/SellContext";
import { useActor } from "./hooks/useActor";
import { Checkout } from "./pages/Checkout";
import { Diagnose } from "./pages/Diagnose";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { Quote } from "./pages/Quote";
import { Sell } from "./pages/Sell";

function AppLayout() {
  const { actor } = useActor();

  useEffect(() => {
    if (actor) {
      actor.initialize().catch(console.error);
    }
  }, [actor]);

  return (
    <SellProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </SellProvider>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const listingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$id",
  component: ProductDetail,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/$id",
  component: Checkout,
});

const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell",
  component: Sell,
});

const diagnoseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell/diagnose",
  component: Diagnose,
});

const quoteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell/quote",
  component: Quote,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  listingRoute,
  checkoutRoute,
  sellRoute,
  diagnoseRoute,
  quoteRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
